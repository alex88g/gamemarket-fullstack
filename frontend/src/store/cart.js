// src/store/cart.js
import { defineStore } from "pinia";
import api from "../api.js";

export const useCartStore = defineStore("cart", {
  state: () => ({
    items: [], // [{ key, gameId, title, platform, image_url, owner_id, type, rental_months, unit_price, total_price }]
    _loaded: false,
  }),

  getters: {
    count: (s) => s.items.length,
    total: (s) =>
      s.items.reduce((sum, it) => sum + Number(it.total_price || 0), 0),
  },

  actions: {
    loadFromStorage() {
      if (this._loaded) return;
      try {
        const raw = localStorage.getItem("cart");
        if (raw) this.items = JSON.parse(raw);
      } catch (err) {
        console.error(err);
      }
      this._loaded = true;
    },
    saveToStorage() {
      localStorage.setItem("cart", JSON.stringify(this.items));
    },

    addItem(item) {
      this.loadFromStorage();
      // ersätt om samma key redan finns (t.ex. samma spel/läge)
      const idx = this.items.findIndex((it) => it.key === item.key);
      if (idx >= 0) this.items[idx] = item;
      else this.items.push(item);
      this.saveToStorage();
    },

    remove(key) {
      this.loadFromStorage();
      this.items = this.items.filter((it) => it.key !== key);
      this.saveToStorage();
    },

    clear() {
      this.items = [];
      this.saveToStorage();
    },

    /**
     * Skapar ordrar via befintligt backend-API (/orders).
     * Returnerar { created: [...], errors: [...] }
     * Vid lyckade ordrar tas artikeln bort ur korgen.
     */
    async checkout() {
      this.loadFromStorage();
      const created = [];
      const errors = [];

      for (const it of this.items) {
        try {
          if (it.type === "buy") {
            const res = await api.post("/orders", {
              gameId: it.gameId,
              type: "buy",
            });
            created.push({ key: it.key, order: res.data });
          } else {
            const months = Math.max(1, parseInt(it.rental_months || 1, 10));
            const res = await api.post("/orders", {
              gameId: it.gameId,
              type: "rent",
              rental_months: months,
            });
            created.push({ key: it.key, order: res.data });
          }
        } catch (e) {
          errors.push({
            key: it.key,
            message: e?.response?.data?.message || "Order misslyckades",
          });
        }
      }

      // ta bort de som gick igenom
      const successKeys = new Set(created.map((c) => c.key));
      this.items = this.items.filter((it) => !successKeys.has(it.key));
      this.saveToStorage();

      return { created, errors };
    },
  },
});
