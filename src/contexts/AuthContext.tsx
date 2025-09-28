import React, { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../lib/firebase";
import AuthTokenService from "../lib/authToken";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  getIdToken,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
} from "firebase/auth";
import type { User as FirebaseUser } from "firebase/auth";

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  googleLogin: () => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Listen for Firebase auth state changes with proper token validation
    let unsub: (() => void) | null = null;
    let tokenValidationCleanup: (() => void) | null = null;

    const validateAndSetUser = async (fbUser: FirebaseUser | null) => {
      if (fbUser) {
        try {
          // Validate the Firebase token is still valid
          await getIdToken(fbUser, true); // Force refresh to validate
          const tokenResult = await fbUser.getIdTokenResult();

          // Check if token is expired
          const now = Date.now();
          const expTime = new Date(tokenResult.expirationTime).getTime();

          if (now >= expTime) {
            console.warn("Firebase token expired, signing out");
            await firebaseSignOut(auth);
            setUser(null);
            localStorage.removeItem("user");
            localStorage.removeItem("access_token");
            setLoading(false);
            return;
          }

          // Token is valid, set user
          const user = {
            id: fbUser.uid,
            name:
              fbUser.displayName ||
              (fbUser.email ? fbUser.email.split("@")[0] : "User"),
            email: fbUser.email || "",
            avatar:
              fbUser.photoURL ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${fbUser.uid}`,
          };
          setUser(user);
          localStorage.setItem("user", JSON.stringify(user));

          // Start token validation interval when user is authenticated
          if (tokenValidationCleanup) {
            tokenValidationCleanup();
          }
          tokenValidationCleanup =
            AuthTokenService.startTokenValidationInterval(10);
        } catch (error) {
          console.warn("Token validation failed, signing out:", error);
          await firebaseSignOut(auth);
          setUser(null);
          localStorage.removeItem("user");
          localStorage.removeItem("access_token");
        }
      } else {
        // No Firebase user, clear everything and stop token validation
        if (tokenValidationCleanup) {
          tokenValidationCleanup();
          tokenValidationCleanup = null;
        }
        setUser(null);
        localStorage.removeItem("user");
        localStorage.removeItem("access_token");
      }
      setLoading(false);
    };

    try {
      unsub = onAuthStateChanged(auth, validateAndSetUser);
    } catch (err) {
      console.error("Firebase auth state listener failed:", err);
      setUser(null);
      localStorage.removeItem("user");
      localStorage.removeItem("access_token");
      setLoading(false);
    }

    return () => {
      if (unsub) unsub();
      if (tokenValidationCleanup) tokenValidationCleanup();
    };
  }, []);

  // Helper: POST firebase token to backend, trying a few common JSON field names
  const postFirebaseTokenToBackend = async (
    path: string,
    firebaseToken: string
  ) => {
    const url = path.startsWith("http") ? path : `http://localhost:8000${path}`;
    // try the most likely field name first (your backend expects `token`)
    const candidates = ["firebase_token"];
    let lastRes: Response | null = null;
    for (const key of candidates) {
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ [key]: firebaseToken }),
        });
        lastRes = res;
        // If backend accepted it, return parsed JSON/text
        if (res.ok) {
          const ct = res.headers.get("content-type") || "";
          const data = ct.includes("application/json")
            ? await res.json().catch(() => null)
            : await res.text().catch(() => null);
          return { ok: true, keyUsed: key, data, res };
        }
        // If validation error (422), try next candidate
        if (res.status === 422) {
          const errBody = await res
            .json()
            .catch(() => ({ detail: "Unprocessable Entity" }));
          console.warn(`Backend validation failed for key '${key}':`, errBody);
          continue;
        }
        // For other non-OK statuses return the body to the caller
        const errBody =
          (await res.text().catch(() => null)) ||
          (await res.json().catch(() => null));
        return {
          ok: false,
          status: res.status,
          statusText: res.statusText,
          body: errBody,
          res,
        };
      } catch (networkErr) {
        console.warn(
          "Network error posting token to backend for key",
          key,
          networkErr
        );
        return { ok: false, error: String(networkErr) };
      }
    }
    // If we tried all candidates and none returned ok, return last response body if available
    if (lastRes) {
      const errBody =
        (await lastRes.text().catch(() => null)) ||
        (await lastRes.json().catch(() => null));
      return {
        ok: false,
        status: lastRes.status,
        statusText: lastRes.statusText,
        body: errBody,
        res: lastRes,
      };
    }
    return { ok: false, error: "No response from backend" };
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const fbUser = cred.user;

      // Get the Firebase ID token and POST it to your backend so it can
      // verify the token and create a server-side session.
      try {
        const firebaseToken = await getIdToken(fbUser);
        const result = await postFirebaseTokenToBackend(
          "/auth/google",
          firebaseToken
        );
        if (result.ok) {
          const data = result.data;
          if (data && typeof data === "object") {
            const merged = {
              id: data.id || fbUser.uid,
              name:
                data.name ||
                fbUser.displayName ||
                email.split("@")[0] ||
                "Demo User",
              email: data.email || fbUser.email || email,
              avatar:
                data.avatar ||
                fbUser.photoURL ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
            };
            setUser(merged);
            localStorage.setItem("user", JSON.stringify(merged));
            // Store the access token if it's in the response
            if (data.access_token) {
              localStorage.setItem("access_token", data.access_token);
            }
            navigate("/");
            return;
          }
        } else {
          console.warn("Backend /auth/google did not accept the token", result);
          // surface validation error to the user if present
          if (result?.body?.detail) {
            setError(String(result.body.detail));
            setLoading(false);
            return;
          }
        }
      } catch (networkErr) {
        console.warn("Failed to POST Firebase token to backend:", networkErr);
        setError("Authentication server unavailable. Please try again later.");
        setLoading(false);
        return;
      }

      // If we reach here, authentication was successful with Firebase
      const user = {
        id: fbUser.uid,
        name: fbUser.displayName || email.split("@")[0] || "User",
        email: fbUser.email || email,
        avatar:
          fbUser.photoURL ||
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      };
      setUser(user);
      localStorage.setItem("user", JSON.stringify(user));
      navigate("/");
    } catch (fbErr: any) {
      // Handle specific Firebase errors
      const errorCode = fbErr?.code;
      const errorMessage = fbErr?.message || "";

      if (errorCode === "auth/user-not-found") {
        setError("No account found with this email address.");
      } else if (errorCode === "auth/wrong-password") {
        setError("Incorrect password. Please try again.");
      } else if (errorCode === "auth/invalid-email") {
        setError("Invalid email address format.");
      } else if (errorCode === "auth/user-disabled") {
        setError("This account has been disabled.");
      } else if (errorCode === "auth/too-many-requests") {
        setError("Too many failed attempts. Please try again later.");
      } else if (
        errorMessage.includes("PASSWORD_LOGIN_DISABLED") ||
        errorCode === "auth/operation-not-allowed"
      ) {
        setError("Email/password sign-in is disabled. Please contact support.");
      } else {
        setError("Login failed. Please check your credentials and try again.");
      }
      console.error("Firebase sign-in failed:", fbErr);
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const fbUser = cred.user;

      try {
        const firebaseToken = await getIdToken(fbUser);
        const result = await postFirebaseTokenToBackend(
          "/auth/google",
          firebaseToken
        );
        if (result.ok) {
          const data = result.data;
          if (data && typeof data === "object") {
            const merged = {
              id: data.id || fbUser.uid,
              name:
                data.name ||
                name ||
                fbUser.displayName ||
                (fbUser.email ? fbUser.email.split("@")[0] : "User"),
              email: data.email || fbUser.email || email,
              avatar:
                data.avatar ||
                fbUser.photoURL ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
            };
            setUser(merged);
            localStorage.setItem("user", JSON.stringify(merged));
            if (data.access_token) {
              localStorage.setItem("access_token", data.access_token);
            }
            navigate("/");
            return;
          }
        } else {
          console.warn(
            "Backend /auth/google returned non-OK on signup",
            result
          );
          if (result?.body?.detail) {
            setError(String(result.body.detail));
            setLoading(false);
            return;
          }
        }
      } catch (networkErr) {
        console.warn(
          "Failed to POST Firebase token to backend on signup:",
          networkErr
        );
        setError("Authentication server unavailable. Please try again later.");
        setLoading(false);
        return;
      }

      // If we reach here, Firebase signup was successful
      const user = {
        id: fbUser.uid,
        name:
          name ||
          fbUser.displayName ||
          (fbUser.email ? fbUser.email.split("@")[0] : "User"),
        email: fbUser.email || email,
        avatar:
          fbUser.photoURL ||
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      };
      setUser(user);
      localStorage.setItem("user", JSON.stringify(user));
      navigate("/");
    } catch (fbErr: any) {
      // Handle specific Firebase errors
      const errorCode = fbErr?.code;
      const errorMessage = fbErr?.message || "";

      if (errorCode === "auth/email-already-in-use") {
        setError("An account with this email already exists.");
      } else if (errorCode === "auth/weak-password") {
        setError("Password is too weak. Please choose a stronger password.");
      } else if (errorCode === "auth/invalid-email") {
        setError("Invalid email address format.");
      } else if (
        errorMessage.includes("PASSWORD_LOGIN_DISABLED") ||
        errorCode === "auth/operation-not-allowed"
      ) {
        setError("Email/password sign-up is disabled. Please contact support.");
      } else {
        setError("Signup failed. Please try again.");
      }
      console.error("Firebase signup failed:", fbErr);
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    setError(null);
    const provider = new GoogleAuthProvider();
    try {
      // Try popup first
      let result;
      try {
        result = await signInWithPopup(auth, provider);
      } catch (popupErr: any) {
        // If popup is blocked or unavailable, fall back to redirect
        console.warn(
          "signInWithPopup failed, falling back to redirect",
          popupErr
        );
        try {
          await signInWithRedirect(auth, provider);
          // Redirect will navigate away; onAuthStateChanged will handle setting user when the redirect completes
          return;
        } catch (redirectErr) {
          console.error("signInWithRedirect failed", redirectErr);
          throw redirectErr;
        }
      }

      const fbUser = result.user;
      try {
        const firebaseToken = await getIdToken(fbUser);
        const result = await postFirebaseTokenToBackend(
          "/auth/google",
          firebaseToken
        );
        if (result.ok) {
          const data = result.data;
          if (data && typeof data === "object") {
            const merged = {
              id: data.id || fbUser.uid,
              name:
                data.name ||
                fbUser.displayName ||
                (fbUser.email ? fbUser.email.split("@")[0] : "User"),
              email: data.email || fbUser.email || "",
              avatar:
                data.avatar ||
                fbUser.photoURL ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${fbUser.uid}`,
            };
            setUser(merged);
            localStorage.setItem("user", JSON.stringify(merged));
            if (data.access_token) {
              localStorage.setItem("access_token", data.access_token);
            }
            navigate("/");
            return;
          }
        } else {
          console.warn(
            "Backend /auth/google returned non-OK for Google login",
            result
          );
          if (result?.body?.detail) setError(String(result.body.detail));
        }
      } catch (networkErr) {
        console.warn(
          "Failed to POST Firebase token to backend for Google login, continuing with client user:",
          networkErr
        );
      }

      const user = {
        id: fbUser.uid,
        name:
          fbUser.displayName ||
          (fbUser.email ? fbUser.email.split("@")[0] : "User"),
        email: fbUser.email || "",
        avatar:
          fbUser.photoURL ||
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${fbUser.uid}`,
      };
      setUser(user);
      localStorage.setItem("user", JSON.stringify(user));
      navigate("/");
      return;
    } catch (err: any) {
      console.error("Google login failed", err);
      setError(err?.message || "Google sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    AuthTokenService.forceLogout();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        googleLogin: loginWithGoogle,
        signup,
        logout,
        loading,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
