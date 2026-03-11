import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  // Allows the browser to automatically send HttpOnly cookies
  // (set by the backend) on every cross-origin request.
  withCredentials: true,
});

// Request interceptor
// Fallback: if the backend hasn't migrated to HttpOnly cookies yet, read the
// JS-accessible cookie so the app still works during transition.
axiosInstance.interceptors.request.use((config) => {
  // Client-side: use document.cookie
  if (typeof document !== "undefined") {
    const match = document.cookie
      .split("; ")
      .find((row) => row.startsWith("auth-token="));

    if (match) {
      const token = decodeURIComponent(match.split("=")[1]);
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  // Server-side: Headers must be passed explicitly to the request or handled in the Component
  return config;
});

// Response interceptor
// On 401 Unauthorized, clear stale cookies and redirect to login.
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof document !== "undefined") {
      // Remove the JS-accessible token cookie
      document.cookie =
        "auth-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict";
      // Redirect to login
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
