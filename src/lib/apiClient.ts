import axios from "axios";
import AuthTokenService from "./authToken";

// Create an axios instance with base configuration
const apiClient = axios.create({
  baseURL: "http://localhost:8000",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add authentication token and validate it
apiClient.interceptors.request.use(
  async (config) => {
    try {
      // Check if we should refresh the token
      const shouldRefresh = await AuthTokenService.shouldRefreshToken();

      if (shouldRefresh) {
        console.log("Refreshing token before API request");
      }

      // Get current valid token
      const token = await AuthTokenService.getCurrentValidToken();

      // Add token to Authorization header
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    } catch (error) {
      console.error("Failed to add auth token to request:", error);

      // If token is invalid or expired, force logout
      await AuthTokenService.forceLogout();

      // Reject the request
      return Promise.reject(error);
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle authentication errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle authentication errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.warn("Received 401 response, checking token validity");

      // Mark that we've tried to refresh this request
      originalRequest._retry = true;

      try {
        // Validate current token
        const validation = await AuthTokenService.validateCurrentUserToken();

        if (!validation.isValid) {
          console.error("Token validation failed:", validation.error);
          await AuthTokenService.forceLogout();
          return Promise.reject(error);
        }

        // Token is valid, retry the request
        const token = await AuthTokenService.getCurrentValidToken();
        originalRequest.headers.Authorization = `Bearer ${token}`;

        return apiClient(originalRequest);
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        await AuthTokenService.forceLogout();
        return Promise.reject(error);
      }
    }

    // Handle other auth-related errors
    if (error.response?.status === 403) {
      console.warn("Access forbidden (403), user may not have permissions");
      // Could redirect to a "Access Denied" page here
    }

    // Handle token expiry errors specifically
    if (
      error.response?.data?.detail?.includes("expired") ||
      error.response?.data?.message?.includes("expired")
    ) {
      console.warn("Server reported token expiry");
      await AuthTokenService.forceLogout();
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
