import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only handle 401 errors for authenticated requests (requests with tokens)
    if (error.response?.status === 401) {
      const token = localStorage.getItem("authToken");
      const isLoginRequest = error.config?.url?.includes("/login");

      // Only redirect if:
      // 1. User has a token (meaning they were previously authenticated)
      // 2. This is NOT a login request
      if (token && !isLoginRequest) {
        // Token expired or invalid for authenticated user → force logout
        localStorage.removeItem("authToken");
        localStorage.removeItem("userData");
        localStorage.removeItem("formState");
        localStorage.removeItem("dialerState");
        localStorage.removeItem("clickToCallToken");
        // Check if already on login page to prevent redirect loop
        if (window.location.pathname !== "/") {
          window.location.href = "/";
        }
      }
      // If it's a login request or user has no token, let the login component handle the error
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
