<template>
  <div class="layout">
    <!-- Skip-link för tangentbordsanvändare -->
    <a href="#main" class="skip-link">Hoppa till innehåll</a>

    <header class="navbar">
      <nav class="nav-inner" role="navigation" aria-label="Huvudmeny">
        <router-link to="/" class="brand" @click="isOpen = false">GameMarket 🎮</router-link>

        <!-- Mobilmeny-knapp -->
        <button
          class="menu-toggle"
          type="button"
          :aria-expanded="isOpen.toString()"
          aria-controls="primary-navigation"
          aria-label="Öppna eller stäng huvudmeny"
          @click="isOpen = !isOpen"
        >
          <span class="menu-icon" aria-hidden="true"></span>
          Meny
        </button>

        <!-- Navigationslänkar -->
        <div
          id="primary-navigation"
          class="nav-links"
          :class="{ open: isOpen }"
          @click.self="isOpen = false"
        >
          <router-link to="/" class="nav-btn" @click="isOpen = false">Marknad</router-link>

          <!-- Visa bara för vanliga användare -->
          <router-link
            v-if="auth.isLoggedIn && !isAdmin"
            to="/mine"
            class="nav-btn"
            @click="isOpen = false"
          >
            Mina spel
          </router-link>

          <router-link
            v-if="auth.isLoggedIn && !isAdmin"
            to="/orders"
            class="nav-btn"
            @click="isOpen = false"
          >
            Mina köp
          </router-link>

          <router-link
            v-if="auth.isLoggedIn && !isAdmin"
            to="/cart"
            class="nav-btn cart-link"
            @click="isOpen = false"
          >
            Kundvagn
            <span
              v-if="cart.count > 0"
              class="cart-badge"
              aria-label="Antal varor i kundvagnen"
              >{{ cart.count }}</span
            >
          </router-link>

          <router-link
            v-if="auth.isLoggedIn && !isAdmin"
            to="/userProfile"
            class="nav-btn"
            @click="isOpen = false"
          >
            Profil
          </router-link>

          <!-- Visa bara för admin -->
          <router-link v-if="isAdmin" to="/admin" class="nav-btn admin" @click="isOpen = false">
            Admin
          </router-link>

          <!-- Inloggning / logout -->
          <router-link
            v-if="!auth.isLoggedIn"
            to="/login"
            class="nav-btn primary"
            @click="isOpen = false"
          >
            Logga in
          </router-link>

          <button v-else class="nav-btn danger" @click="() => { isOpen = false; logout(); }">
            Logga ut ({{ auth.user?.username }})
          </button>
        </div>
      </nav>
    </header>

    <main id="main" class="page-wrapper" @click="isOpen = false">
      <router-view />
    </main>

    <Toast />

    <footer class="site-footer">
      <nav class="footer-links">
        <router-link to="/terms" class="footer-link">Allmänna villkor</router-link>
        <span class="sep">•</span>
        <router-link to="/privacy" class="footer-link">Integritetspolicy (GDPR)</router-link>
      </nav>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useAuthStore } from "./store/auth.js";
import { useCartStore } from "./store/cart.js";
import Toast from "./components/Toast.vue";

const auth = useAuthStore();
const cart = useCartStore();

const isAdmin = computed(() => auth.user?.role === "admin");
const isOpen = ref(false);

function logout() {
  try { cart.clear(); } catch (err) { console.error("Logout failed", err); }
  auth.logout();
}

// Stäng mobilmenyn på Escape och när viewport blir bred
const onKeydown = (e) => { if (e.key === "Escape") isOpen.value = false; };
const onResize = () => { if (window.innerWidth >= 901) isOpen.value = false; };

onMounted(() => {
  window.addEventListener("keydown", onKeydown);
  window.addEventListener("resize", onResize);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", onKeydown);
  window.removeEventListener("resize", onResize);
});
</script>

<style>
:root {
  --bg-body: #0f172a;
  --bg-card: #1e2537;
  --text-main: #f8fafc;
  --text-dim: #94a3b8;
  --accent: #4f46e5;
  --accent-hover: #6366f1;
  --danger: #dc2626;
  --radius-lg: 1rem;
  --radius-sm: 0.5rem;
  --border-color: rgba(255, 255, 255, 0.08);
  --shadow-card: 0 24px 48px rgba(0, 0, 0, 0.6);
  --shadow-pop: 0 20px 40px rgba(0, 0, 0, 0.8);
  --space-xl: clamp(1.25rem, 2vw, 2rem);
  --space-lg: clamp(1rem, 1.5vw, 1.25rem);
  --space-md: clamp(0.6rem, 1vw, 0.75rem);
  --space-sm: 0.5rem;
  --font-size-title: clamp(1rem, 0.7vw + 0.9rem, 1.25rem);
  --font-size-body: clamp(0.95rem, 0.4vw + 0.8rem, 1rem);
  --nav-height: 56px;
}

* { box-sizing: border-box; }

html { scroll-behavior: smooth; }

body {
  margin: 0;
  background: var(--bg-body);
  color: var(--text-main);
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Inter", Roboto, "Segoe UI", sans-serif;
  font-size: var(--font-size-body);
}

.layout {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
}

/* Skip to content */
.skip-link {
  position: absolute;
  left: -9999px;
  top: auto;
  width: 1px;
  height: 1px;
  overflow: hidden;
}
.skip-link:focus {
  left: 0;
  top: 0;
  width: auto;
  height: auto;
  padding: 0.5rem 0.75rem;
  background: var(--accent);
  color: #fff;
  z-index: 1000;
}

.navbar {
  position: sticky;
  top: 0;
  z-index: 20;
  border-bottom: 1px solid var(--border-color);
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(10px);
}

.nav-inner {
  max-width: min(1200px, 100%);
  margin: 0 auto;
  padding: var(--space-md) var(--space-lg);
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: var(--space-md);
  min-height: var(--nav-height);
}

.brand {
  font-weight: 700;
  font-size: 1rem;
  color: var(--text-main);
  text-decoration: none;
  letter-spacing: 0.2px;
}

/* Mobilmeny-knapp */
.menu-toggle {
  appearance: none;
  border: 1px solid var(--border-color);
  background: transparent;
  color: var(--text-main);
  border-radius: var(--radius-sm);
  padding: 0.5rem 0.75rem;
  font-size: 0.9rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}
.menu-icon {
  width: 20px;
  height: 2px;
  background: currentColor;
  position: relative;
}
.menu-icon::before,
.menu-icon::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  height: 2px;
  background: currentColor;
}
.menu-icon::before { top: -6px; }
.menu-icon::after { top: 6px; }

/* Nav-länkar (mobil först) */
.nav-links {
  grid-column: 1 / -1;
  display: grid;
  grid-auto-rows: min-content;
  gap: var(--space-md);
  overflow: hidden;
  max-height: 0;
  padding: 0 var(--space-lg);
  border-bottom: 1px solid transparent;
  transition: max-height 240ms ease;
}
.nav-links.open {
  max-height: 80vh; /* expanderar */
  padding-bottom: var(--space-md);
  border-bottom-color: var(--border-color);
}

.nav-btn {
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  padding: 0.7rem 0.9rem; /* bättre touch-target */
  font-size: 0.9rem;
  color: var(--text-main);
  text-decoration: none;
  cursor: pointer;
}
.nav-btn:focus-visible {
  outline: 3px solid rgba(99, 102, 241, 0.6);
  outline-offset: 2px;
}

.nav-btn.primary { background: var(--accent); border-color: var(--accent); }
.nav-btn.primary:hover { background: var(--accent-hover); border-color: var(--accent-hover); }

.nav-btn.danger { border-color: rgba(220, 38, 38, 0.4); color: #fff; }
.nav-btn.danger:hover { background: rgba(220, 38, 38, 0.15); border-color: rgba(220, 38, 38, 0.6); }

.nav-btn.admin { color: #fde047; border-color: rgba(253, 224, 71, 0.4); }
.nav-btn.admin:hover { background: rgba(253, 224, 71, 0.1); border-color: rgba(253, 224, 71, 0.6); }

.nav-btn.router-link-active {
  border-color: var(--accent);
  background: rgba(99, 102, 241, 0.15);
  color: var(--accent-hover);
  font-weight: 600;
}

/* Desktop-läge */
@media (min-width: 901px) {
  .menu-toggle { display: none; }
  .nav-inner { grid-template-columns: auto 1fr; }
  .nav-links {
    grid-column: 2;
    max-height: none;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: var(--space-md);
    padding: 0;
    border: 0;
  }
}

.page-wrapper {
  flex: 1;
  width: 100%;
  max-width: 1200px;
  margin: var(--space-xl) auto;
  padding: 0 var(--space-lg) var(--space-xl);
  display: grid;
  gap: var(--space-xl);
}

/* Tätare vertikal rytm på små skärmar */
@media (max-width: 600px) {
  .page-wrapper { margin: var(--space-lg) auto; gap: var(--space-lg); }
}

.card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  padding: var(--space-lg);
  color: var(--text-main);
}

.card-header { display: flex; justify-content: space-between; align-items: flex-start; gap: var(--space-md); margin-bottom: var(--space-md); }
.card-title { font-size: var(--font-size-title); font-weight: 600; color: var(--text-main); line-height: 1.3; }
.card-sub { color: var(--text-dim); font-size: 0.85rem; }

.row { display: grid; row-gap: var(--space-md); }
.row-2col { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-md); }
@media (max-width: 800px) { .row-2col { grid-template-columns: 1fr; } }

.btn { appearance: none; border: 1px solid var(--border-color); background: var(--bg-card); border-radius: var(--radius-sm); font-size: 0.9rem; padding: 0.65rem 0.9rem; color: var(--text-main); cursor: pointer; line-height: 1.2; }
.btn.primary { background: var(--accent); border-color: var(--accent); }
.btn.primary:hover { background: var(--accent-hover); border-color: var(--accent-hover); }
.btn.danger { border-color: rgba(220, 38, 38, 0.4); color: #fff; }
.btn.danger:hover { background: rgba(220, 38, 38, 0.15); border-color: rgba(220, 38, 38, 0.6); }
.btn.outline { background: transparent; }
.btn:focus-visible { outline: 3px solid rgba(99, 102, 241, 0.6); outline-offset: 2px; }

.input-group { display: grid; gap: 0.4rem; margin-right: 1.5rem; }
.input-label { font-size: 0.85rem; color: var(--text-main); font-weight: 500; }
.input-field { width: 100%; background: #0f172a; border-radius: var(--radius-sm); border: 1px solid var(--border-color); padding: 0.6rem 0.7rem; font-size: 0.95rem; color: var(--text-main); outline: none; }
.input-field:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.3); }

.table-wrapper { overflow-x: auto; }
.table-wrapper::-webkit-scrollbar { height: 10px; }
.table-wrapper::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 999px; }

table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
th { text-align: left; font-weight: 600; color: var(--text-main); background: rgba(255, 255, 255, 0.03); }
th, td { padding: 0.7rem 0.75rem; border-bottom: 1px solid var(--border-color); vertical-align: top; }

.badge { font-size: 0.75rem; line-height: 1.2; border-radius: var(--radius-sm); padding: 0.35rem 0.55rem; border: 1px solid var(--border-color); }
.badge.success { background: rgba(16, 185, 129, 0.15); border-color: rgba(16, 185, 129, 0.5); color: #6ee7b7; }
.badge.warn { background: rgba(253, 224, 71, 0.1); border-color: rgba(253, 224, 71, 0.4); color: #fde047; }
.badge.danger { background: rgba(220, 38, 38, 0.15); border-color: rgba(220, 38, 38, 0.6); color: #fecaca; }

.modal-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.6); display: grid; place-items: center; z-index: 999; }
.modal-card { background: var(--bg-card); border-radius: var(--radius-lg); border: 1px solid var(--border-color); box-shadow: var(--shadow-pop); padding: var(--space-lg); width: min(480px, 92vw); display: grid; row-gap: var(--space-md); }

.site-footer { margin-top: 3rem; padding: 1.25rem 0; text-align: center; border-top: 1px solid var(--border-color); color: var(--text-dim); }
.footer-links { display: inline-flex; align-items: center; gap: 0.5rem; }
.sep { opacity: 0.6; }
.footer-link:hover { color: var(--text-main); border-color: var(--text-main); }
.footer-link:visited { color: var(--text-dim); border-color: rgba(148, 163, 184, 0.35); }

/* ------- Kundvagnsbadge ------- */
.nav-links .cart-link { position: relative; padding-right: 2rem; }
.cart-badge { position: absolute; top: -6px; right: -8px; min-width: 1.25rem; height: 1.25rem; padding: 0 0.3rem; border-radius: 999px; background: #22c55e; border: 1px solid rgba(255, 255, 255, 0.2); display: inline-grid; place-items: center; font-size: 0.7rem; font-weight: 700; color: #0f172a; box-shadow: 0 6px 16px rgba(34, 197, 94, 0.35); }

/* Minska animationer för användare som valt det */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation: none !important; transition: none !important; }
}
</style>
