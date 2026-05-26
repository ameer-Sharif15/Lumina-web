import axios from "axios";

// Base URL from env or fallback to Render/Localhost
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://lumina-uqhl.onrender.com/api";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 80000,
  headers: {
    Accept: "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("admin_token") || localStorage.getItem("user_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      if (error.response.status === 401 && typeof window !== "undefined") {
        // Unauthorized - could redirect to login
        // localStorage.removeItem("admin_token");
        // window.location.href = "/admin";
      }
    }
    return Promise.reject(error);
  },
);

export default apiClient;
