import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
  timeout: 15000,
});

api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const storedRefreshToken = localStorage.getItem("refreshToken");
        if (!storedRefreshToken) {
          throw new Error("No refresh token available");
        }

        const refreshRes = await axios.post(
          `${api.defaults.baseURL}/auth/refresh`,
          { refreshToken: storedRefreshToken },
          { withCredentials: true },
        );
        const newToken = refreshRes.data?.data?.accessToken;
        const newRefresh = refreshRes.data?.data?.refreshToken;
        if (newToken) {
          localStorage.setItem("token", newToken);
          document.cookie = `accessToken=${newToken}; path=/; max-age=604800; SameSite=Lax`;
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
        if (newRefresh) {
          localStorage.setItem("refreshToken", newRefresh);
        }

        return api(originalRequest);
      } catch (refreshError) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          document.cookie =
            "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;