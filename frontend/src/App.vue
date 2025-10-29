<template>
  <div class="layout">
    <header class="navbar">
      <nav class="nav-inner">
        <router-link to="/" class="brand">GameMarket 🎮</router-link>

        <div class="nav-links">
          <router-link to="/" class="nav-btn">Marknad</router-link>

          <!-- Visa bara för vanliga användare -->
          <router-link
            v-if="auth.isLoggedIn && auth.user?.role !== 'admin'"
            to="/mine"
            class="nav-btn"
          >
            Mina spel
          </router-link>

          <router-link
            v-if="auth.isLoggedIn && auth.user?.role !== 'admin'"
            to="/orders"
            class="nav-btn"
          >
            Mina köp
          </router-link>

          <router-link
            v-if="auth.isLoggedIn && auth.user?.role !== 'admin'"
            to="/userProfile"
            class="nav-btn"
          >
            Profil
          </router-link>

          <!-- Visa bara för admin -->
          <router-link
            v-if="auth.user?.role === 'admin'"
            to="/admin"
            class="nav-btn admin"
          >
            Admin
          </router-link>

          <!-- Inloggning / logout -->
          <router-link
            v-if="!auth.isLoggedIn"
            to="/login"
            class="nav-btn primary"
          >
            Logga in
          </router-link>

          <button
            v-else
            class="nav-btn danger"
            @click="logout"
          >
            Logga ut ({{ auth.user?.username }})
          </button>
        </div>
      </nav>
    </header>

    <main class="page-wrapper">
      <router-view />
    </main>

    <Toast />

    <footer class="site-footer">
      <router-link to="/privacy" class="footer-link">Integritetspolicy (GDPR)</router-link>
    </footer>

  </div>
</template>

<script setup>
import { useAuthStore } from './store/auth.js'
import Toast from './components/Toast.vue'

const auth = useAuthStore()

function logout() {
  auth.logout()
}
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
  --radius-sm: .5rem;
  --border-color: rgba(255,255,255,0.08);
  --shadow-card: 0 24px 48px rgba(0,0,0,0.6);
  --shadow-pop: 0 20px 40px rgba(0,0,0,0.8);
  --space-xl: 2rem;
  --space-lg: 1.25rem;
  --space-md: .75rem;
  --space-sm: .5rem;
  --font-size-title: 1.1rem;
  --font-size-body: .95rem;
}

body {
  margin: 0;
  background: var(--bg-body);
  color: var(--text-main);
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Inter", Roboto, "Segoe UI", sans-serif;
}

.layout {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
}

.navbar {
  border-bottom: 1px solid var(--border-color);
  background: rgba(15,23,42,0.6);
  backdrop-filter: blur(10px);
  position: sticky;
  top: 0;
  z-index: 10;
}

.nav-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-md) var(--space-lg);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--space-md);
}

.brand {
  font-weight: 600;
  font-size: 1rem;
  color: var(--text-main);
  text-decoration: none;
}

.nav-links {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-md);
}

.nav-btn {
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  padding: .5rem .75rem;
  font-size: .8rem;
  color: var(--text-main);
  text-decoration: none;
  cursor: pointer;
}

.nav-btn.primary {
  background: var(--accent);
  border-color: var(--accent);
}
.nav-btn.primary:hover {
  background: var(--accent-hover);
  border-color: var(--accent-hover);
}

.nav-btn.danger {
  border-color: rgba(220,38,38,.4);
  color: #fff;
}
.nav-btn.danger:hover {
  background: rgba(220,38,38,.15);
  border-color: rgba(220,38,38,.6);
}

.nav-btn.admin {
  color: #fde047;
  border-color: rgba(253,224,71,.4);
}
.nav-btn.admin:hover {
  background: rgba(253,224,71,.1);
  border-color: rgba(253,224,71,.6);
}

.page-wrapper {
  flex: 1;
  max-width: 1200px;
  width: 100%;
  margin: var(--space-xl) auto;
  padding: 0 var(--space-lg) var(--space-xl);
  display: grid;
  gap: var(--space-xl);
}

.card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  padding: var(--space-lg);
  color: var(--text-main);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-md);
  margin-bottom: var(--space-md);
}

.card-title {
  font-size: var(--font-size-title);
  font-weight: 600;
  color: var(--text-main);
  line-height: 1.3;
}

.card-sub {
  color: var(--text-dim);
  font-size: .8rem;
}

.row {
  display: grid;
  row-gap: var(--space-md);
}

.row-2col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-md);
}
@media(max-width:700px){
  .row-2col {
    grid-template-columns: 1fr;
  }
}

.btn {
  appearance: none;
  border: 1px solid var(--border-color);
  background: var(--bg-card);
  border-radius: var(--radius-sm);
  font-size: .8rem;
  padding: .5rem .75rem;
  color: var(--text-main);
  cursor: pointer;
  line-height: 1.2;
}
.btn.primary {
  background: var(--accent);
  border-color: var(--accent);
}
.btn.primary:hover {
  background: var(--accent-hover);
  border-color: var(--accent-hover);
}
.btn.danger {
  border-color: rgba(220,38,38,.4);
  color: #fff;
}
.btn.danger:hover {
  background: rgba(220,38,38,.15);
  border-color: rgba(220,38,38,.6);
}
.btn.outline {
  background: transparent;
}

.input-group {
  display: grid;
  gap: .4rem;
}
.input-label {
  font-size: .8rem;
  color: var(--text-main);
  font-weight: 500;
}
.input-field {
  width: 100%;
  background: #0f172a;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-color);
  padding: .6rem .7rem;
  font-size: .9rem;
  color: var(--text-main);
  outline: none;
}
.input-field:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(99,102,241,.3);
}

.table-wrapper {
  overflow-x: auto;
}
table {
  width: 100%;
  border-collapse: collapse;
  font-size: .85rem;
}
th {
  text-align: left;
  font-weight: 500;
  color: var(--text-main);
  background: rgba(255,255,255,0.03);
}
th, td {
  padding: .6rem .75rem;
  border-bottom: 1px solid var(--border-color);
  vertical-align: top;
}
.badge {
  font-size: .7rem;
  line-height: 1.2;
  border-radius: var(--radius-sm);
  padding: .3rem .5rem;
  border: 1px solid var(--border-color);
}
.badge.success {
  background: rgba(16,185,129,.15);
  border-color: rgba(16,185,129,.5);
  color: #6ee7b7;
}
.badge.warn {
  background: rgba(253,224,71,.1);
  border-color: rgba(253,224,71,.4);
  color: #fde047;
}
.badge.danger {
  background: rgba(220,38,38,.15);
  border-color: rgba(220,38,38,.6);
  color: #fecaca;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.6);
  display: grid;
  place-items: center;
  z-index: 999;
}
.modal-card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-pop);
  padding: var(--space-lg);
  width: min(400px,90vw);
  display: grid;
  row-gap: var(--space-md);
}
.site-footer {
  margin-top: 3rem;
  padding: 1.25rem 0;
  text-align: center;
  border-top: 1px solid var(--border-color);
  color: var(--text-dim);
}

.footer-link {
  color: var(--text-main);
  text-decoration: none;
  border-bottom: 1px dashed rgba(148,163,184,.35);
  padding-bottom: 2px;
  transition: color .15s ease, border-color .15s ease;
}
.footer-link:hover {
  color: var(--text-main);
  border-color: var(--text-main);
}
.footer-link:visited {
  color: var(--text-dim);
  border-color: rgba(148,163,184,.35);
}
</style>
