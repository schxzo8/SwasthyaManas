// src/services/api.ts
import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { syncSocketAuth } from "./socket";

const API = axios.create({
  baseURL: "http://localhost:5000",
  withCredentials: true, // IMPORTANT: send refresh cookie
});

API.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean };

let isRefreshing = false;
let queue: Array<(token: string | null) => void> = [];

function processQueue(token: string | null) {
  queue.forEach((cb) => cb(token));
  queue = [];
}

API.interceptors.response.use(
  (res: AxiosResponse) => res,
  async (err: AxiosError) => {
    const original = err.config as RetryConfig | undefined;

    // If we don't have config, or it's not 401 -> normal reject
    if (!original || err.response?.status !== 401) {
      return Promise.reject(err);
    }

    // Avoid infinite loop: if refresh endpoint itself fails with 401
    if (original.url?.includes("/api/auth/refresh")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return Promise.reject(err);
    }

    // Only retry once
    if (original._retry) {
      return Promise.reject(err);
    }
    original._retry = true;

    // If refresh already running -> wait in queue
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        queue.push((token) => {
          if (!token) return reject(err);

          original.headers = original.headers ?? {};
          original.headers.Authorization = `Bearer ${token}`;
          resolve(API(original));
        });
      });
    }

    isRefreshing = true;

    try {
      // Refresh using cookie
      const refreshRes = await API.get("/api/auth/refresh");
      const newToken: string = (refreshRes.data as any).token;

      localStorage.setItem("token", newToken);
      localStorage.setItem("user", JSON.stringify((refreshRes.data as any).user));

      // calling syncSocketAuth
      syncSocketAuth(newToken);

      processQueue(newToken);

      original.headers = original.headers ?? {};
      original.headers.Authorization = `Bearer ${newToken}`;

      return API(original);
    } catch (refreshErr) {
      processQueue(null);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return Promise.reject(refreshErr);
    } finally {
      isRefreshing = false;
    }
  }
);

export default API;