import { auth } from "./firebase";
import { getIdToken, signOut as firebaseSignOut } from "firebase/auth";

interface TokenValidationResult {
  isValid: boolean;
  isExpired: boolean;
  error?: string;
}

export class AuthTokenService {
  /**
   * Validate the current user's Firebase token
   */
  static async validateCurrentUserToken(): Promise<TokenValidationResult> {
    try {
      const currentUser = auth.currentUser;

      if (!currentUser) {
        return {
          isValid: false,
          isExpired: false,
          error: "No authenticated user",
        };
      }

      // Force refresh token to check validity
      await getIdToken(currentUser, true);
      const tokenResult = await currentUser.getIdTokenResult(true);

      // Check if token is expired
      const now = Date.now();
      const expTime = new Date(tokenResult.expirationTime).getTime();

      if (now >= expTime) {
        return { isValid: false, isExpired: true, error: "Token expired" };
      }

      return { isValid: true, isExpired: false };
    } catch (error: any) {
      console.error("Token validation failed:", error);

      // Check for specific Firebase auth errors
      if (
        error?.code === "auth/user-token-expired" ||
        error?.code === "auth/id-token-expired"
      ) {
        return { isValid: false, isExpired: true, error: "Token expired" };
      }

      if (error?.code === "auth/user-disabled") {
        return {
          isValid: false,
          isExpired: false,
          error: "User account disabled",
        };
      }

      if (error?.code === "auth/network-request-failed") {
        return {
          isValid: false,
          isExpired: false,
          error: "Network error during token validation",
        };
      }

      return {
        isValid: false,
        isExpired: false,
        error: error?.message || "Token validation failed",
      };
    }
  }

  /**
   * Get the current valid token or throw an error
   */
  static async getCurrentValidToken(): Promise<string> {
    const validation = await this.validateCurrentUserToken();

    if (!validation.isValid) {
      throw new Error(validation.error || "Invalid token");
    }

    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("No authenticated user");
    }

    return await getIdToken(currentUser, false); // Don't force refresh again
  }

  /**
   * Check if we should refresh the token (within 5 minutes of expiry)
   */
  static async shouldRefreshToken(): Promise<boolean> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return false;

      const tokenResult = await currentUser.getIdTokenResult(false);
      const now = Date.now();
      const expTime = new Date(tokenResult.expirationTime).getTime();
      const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds

      return expTime - now <= fiveMinutes;
    } catch (error) {
      console.error("Error checking token refresh requirement:", error);
      return true; // If we can't check, assume we should refresh
    }
  }

  /**
   * Force logout and clear all authentication data
   */
  static async forceLogout(): Promise<void> {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error("Error during Firebase sign out:", error);
    } finally {
      // Always clear local storage regardless of Firebase signOut success
      localStorage.removeItem("user");
      localStorage.removeItem("access_token");

      // Redirect to login page
      window.location.href = "/login";
    }
  }

  /**
   * Set up automatic token validation interval
   */
  static startTokenValidationInterval(
    intervalMinutes: number = 10
  ): () => void {
    const intervalMs = intervalMinutes * 60 * 1000;

    const intervalId = setInterval(async () => {
      const validation = await this.validateCurrentUserToken();

      if (!validation.isValid) {
        console.warn(
          "Token validation failed during interval check:",
          validation.error
        );

        if (validation.isExpired) {
          console.log("Token expired, forcing logout");
          await this.forceLogout();
        }
      }
    }, intervalMs);

    // Return cleanup function
    return () => clearInterval(intervalId);
  }
}

export default AuthTokenService;
