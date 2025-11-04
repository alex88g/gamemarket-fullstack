// src/store/auth.js
import { defineStore } from "pinia";
import api from "../api.js";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: null,
    user: null,
  }),
  getters: {
    isLoggedIn: (state) => !!state.token && !!state.user,
  },
  actions: {
    loadFromStorage() {
      const raw = localStorage.getItem("auth");
      if (!raw) return;
      try {
        const parsed = JSON.parse(raw);
        this.token = parsed.token;
        this.user = parsed.user;
      } catch (err) {
        console.error(err);
      }
    },
    saveToStorage() {
      localStorage.setItem(
        "auth",
        JSON.stringify({ token: this.token, user: this.user }),
      );
    },
    async login(email, password) {
      const res = await api.post("/auth/login", { email, password });
      this.token = res.data.token;
      this.user = res.data.user;
      this.saveToStorage();
    },
    async register(username, email, password) {
      await api.post("/auth/register", { username, email, password });
      // du kan välja att autologga in här om du vill
    },
    logout() {
      this.token = null;
      this.user = null;
      localStorage.removeItem("auth");
    },
  },
});

// ⛔ INTE detta här längre:
// const store = useAuthStore()
// store.loadFromStorage()
