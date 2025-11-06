// src/api.js
import axios from "axios";

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

export default api;
