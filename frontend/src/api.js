// src/api.js
import axios from "axios";
import { useRouter } from "vue-router";

const router = useRouter();

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Lägg till Authorization-header automatiskt
api.interceptors.request.use((config) => {
  const raw = localStorage.getItem("auth");
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed.token) {
        config.headers.Authorization = `Bearer ${parsed.token}`;
      }
    } catch (err) {
      console.error("Auth header failed", err);
    }
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("auth");
      router.push("/login");
    }
    return Promise.reject(err);
  },
);

export default api;
