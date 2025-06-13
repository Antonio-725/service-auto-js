// // //utils/apiClient.ts
import axios from "axios";
const apiClient = axios.create({
  baseURL: "http://localhost:5000",
  withCredentials: false,
});

// Add token automatically to every request
apiClient.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("token"); // 🔁 CHANGED
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for consistent error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorMessage =
      error.response?.data?.message || "An unexpected error occurred";
    if (error.response?.status === 401) {
      // Clear sessionStorage on 401 (unauthorized) response 🔁 CHANGED
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("role");
      sessionStorage.removeItem("userId");
      sessionStorage.removeItem("username");
      // Redirect to login
      window.location.href = "/login";
    }
    return Promise.reject(new Error(errorMessage));
  }
);

export const login = async (email: string, password: string) => {
  try {
    const response = await apiClient.post("/api/auth/login", { email, password });
    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "An unexpected error occurred";
    throw new Error(errorMessage);
  }
};

export const verifyToken = async () => {
  try {
    const response = await apiClient.get("/api/auth/verify");
    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Token verification failed";
    throw new Error(errorMessage);
  }
};

export const registerUser = async (
  username: string,
  email: string,
  phone: string,
  password: string
) => {
  try {
    const response = await apiClient.post("/api/users/register", {
      username,
      email,
      phone,
      password,
    });
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || "Registration failed";
    throw new Error(message);
  }
};

export const logout = () => {
  sessionStorage.removeItem("token"); // 🔁 CHANGED
  sessionStorage.removeItem("role");
  sessionStorage.removeItem("userId");
  sessionStorage.removeItem("username");
  window.location.href = "/login";
};

export default apiClient;
