<!-- src/views/AdminView.vue -->
<template>
  <section class="row" style="gap: 2rem">
    <header class="row" style="gap: 0.5rem">
      <h1 class="card-title">Adminpanel</h1>
      <p class="card-sub">
        Endast admin. Moderera annonser och se alla ordrar.
      </p>
    </header>

    <!-- om inte admin -->
    <div v-if="!isAdmin" class="card">
      <div class="card-title">Åtkomst nekad</div>
      <div class="card-sub">Du är inte admin.</div>
    </div>

    <template v-else>
      <!-- ANNONSER / MODERERING -->
      <div class="card">
        <div class="card-header" style="margin-top: -0.25rem">
          <h2 class="card-title" style="margin: 0">Annonser (moderering)</h2>
          <span class="card-sub"
            >{{ filteredGames.length }} av {{ allGames.length }} annonser</span
          >
        </div>
        <p class="card-sub" style="margin-top: -0.5rem; margin-bottom: 1rem">
          Blockera olämpliga annonser. Blockerade annonser syns inte på
          marknaden.
        </p>

        <!-- Filterrad -->
        <div class="filters">
          <label class="input-group">
            <span class="input-label">Sök (titel, plattform, ägare)</span>
            <input
              v-model="qGames"
              type="search"
              class="input-field"
              placeholder="Sök annonser…"
              aria-label="Sök i annonser"
            />
          </label>

          <!-- ersätt din nuvarande Status-grupp -->
          <label class="input-group select" style="min-width: 190px">
            <span class="input-label">Status</span>
            <select
              v-model="statusFilter"
              class="input-field select-reset"
              aria-label="Filtrera på status"
            >
              <option value="">Alla</option>
              <option value="available">Tillgänglig</option>
              <option value="reserved">Reserverad</option>
              <option value="rented">Uthyrd</option>
              <option value="sold">Såld</option>
              <option value="blocked">Blockerad</option>
            </select>
          </label>

          <label class="checkbox">
            <input v-model="withImageOnly" type="checkbox" />
            <span>Endast med bild</span>
          </label>

          <button
            class="btn outline"
            @click="resetGameFilters"
            aria-label="Rensa filter"
          >
            Rensa filter
          </button>
        </div>

        <div class="table-wrapper">
          <table class="stacked-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Titel</th>
                <th>Ägare</th>
                <th>Status</th>
                <th>Säljes</th>
                <th>Hyra/mån</th>
                <th>Bild</th>
                <th>Moderering</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="g in filteredGames" :key="g.id">
                <td :data-label="'ID'">#{{ g.id }}</td>

                <td :data-label="'Titel'" style="min-width: 160px">
                  <div style="font-weight: 500; color: var(--text-main)">
                    {{ g.title }}
                  </div>
                  <div class="card-sub" style="font-size: 0.7rem">
                    {{ g.platform }}
                  </div>
                </td>

                <td :data-label="'Ägare'" style="min-width: 120px">
                  <div style="font-weight: 500; color: var(--text-main)">
                    {{ g.ownerName }}
                  </div>
                  <div class="card-sub" style="font-size: 0.7rem">
                    owner_id: {{ g.owner_id }}
                  </div>
                </td>

                <td :data-label="'Status'">
                  <span class="badge" :class="badgeClass(g.status)">
                    {{ statusLabel(g.status) }}
                  </span>
                </td>

                <td :data-label="'Säljes'">{{ g.price_sell ?? "-" }} kr</td>
                <td :data-label="'Hyra/mån'">
                  {{ g.price_rent_per_month ?? "-" }} kr
                </td>

                <td :data-label="'Bild'">
                  <img
                    v-if="g.image_url"
                    :src="g.image_url"
                    :alt="g.title"
                    class="thumb"
                  />
                  <span v-else class="card-sub">–</span>
                </td>

                <td :data-label="'Moderering'" class="actions-cell">
                  <button
                    v-if="g.status !== 'blocked'"
                    class="btn danger"
                    :disabled="busyId === g.id"
                    @click="blockGame(g)"
                    :aria-label="`Blockera annons ${g.id}`"
                  >
                    {{ busyId === g.id ? "Blockerar…" : "Blockera" }}
                  </button>

                  <button
                    v-else
                    class="btn primary"
                    :disabled="busyId === g.id"
                    @click="unblockGame(g)"
                    :aria-label="`Tillåt annons ${g.id} igen`"
                  >
                    {{ busyId === g.id ? "Tillåter…" : "Tillåt igen" }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          <div v-if="!isLoading && filteredGames.length === 0" class="empty">
            <div class="card-sub">Inga annonser matchar filtren.</div>
          </div>
        </div>
      </div>

      <!-- ALLA ORDRAR -->
      <div class="card">
        <div class="card-header" style="margin-top: -0.25rem">
          <h2 class="card-title" style="margin: 0">Alla ordrar</h2>
          <span class="card-sub"
            >{{ filteredOrders.length }} av {{ allOrders.length }} ordrar</span
          >
        </div>
        <p class="card-sub" style="margin-top: -0.5rem; margin-bottom: 1rem">
          Köphistorik & hyror i hela systemet.
        </p>

        <!-- Filterrad -->
        <div class="filters">
          <label class="input-group">
            <span class="input-label">Sök (köpare, spel)</span>
            <input
              v-model="qOrders"
              type="search"
              class="input-field"
              placeholder="Sök ordrar…"
              aria-label="Sök i ordrar"
            />
          </label>

          <label class="input-group" style="min-width: 160px">
            <span class="input-label">Typ</span>
            <select
              v-model="typeFilter"
              class="input-field"
              aria-label="Filtrera på ordertyp"
            >
              <option value="">Alla</option>
              <option value="buy">buy</option>
              <option value="rent">rent</option>
            </select>
          </label>

          <button
            class="btn outline"
            @click="resetOrderFilters"
            aria-label="Rensa filter"
          >
            Rensa filter
          </button>
        </div>

        <div class="table-wrapper">
          <table class="stacked-table">
            <thead>
              <tr>
                <th>Order-ID</th>
                <th>Köpare</th>
                <th>Spel</th>
                <th>Typ</th>
                <th>Pris</th>
                <th>Period</th>
                <th>Skapad</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="o in filteredOrders" :key="o.id">
                <td :data-label="'Order-ID'">#{{ o.id }}</td>

                <td :data-label="'Köpare'">
                  <div style="font-weight: 500; color: var(--text-main)">
                    {{ o.buyerName }}
                  </div>
                  <div class="card-sub" style="font-size: 0.7rem">
                    id: {{ o.buyer_id }}
                  </div>
                </td>

                <td :data-label="'Spel'">
                  <div style="font-weight: 500; color: var(--text-main)">
                    {{ o.gameTitle }}
                  </div>
                  <div class="card-sub" style="font-size: 0.7rem">
                    gameId: {{ o.game_id }}
                  </div>
                </td>

                <td :data-label="'Typ'">
                  <span
                    class="badge"
                    :class="o.type === 'buy' ? 'success' : 'warn'"
                    >{{ o.type }}</span
                  >
                </td>

                <td :data-label="'Pris'">{{ o.total_price }} kr</td>

                <td :data-label="'Period'">
                  <div v-if="o.type === 'rent'">
                    <div class="card-sub">{{ o.rental_months }} mån</div>
                  </div>
                  <div v-else>–</div>
                </td>

                <td :data-label="'Skapad'" class="card-sub">
                  {{ formatDateTime(o.created_at) }}
                </td>
              </tr>
            </tbody>
          </table>

          <div v-if="!isLoading && filteredOrders.length === 0" class="empty">
            <div class="card-sub">Inga ordrar matchar filtren.</div>
          </div>
        </div>
      </div>
    </template>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import api from "../api.js";
import { useAuthStore } from "../store/auth.js";
import { useToastStore } from "../store/toast.js";
import { statusLabel } from "../utils/status.js";

const auth = useAuthStore();
const toast = useToastStore();
const router = useRouter();

const allGames = ref([]);
const allOrders = ref([]);
const isLoading = ref(true);
const busyId = ref(null);

const isAdmin = computed(() => auth.user?.role === "admin");

/* --------- Filtrering: Annonser ---------- */
const qGames = ref("");
const statusFilter = ref("");
const withImageOnly = ref(false);

const filteredGames = computed(() => {
  const q = qGames.value.trim().toLowerCase();
  return allGames.value.filter((g) => {
    const matchesQ =
      !q ||
      g.title?.toLowerCase().includes(q) ||
      g.platform?.toLowerCase().includes(q) ||
      g.ownerName?.toLowerCase().includes(q);
    const matchesStatus =
      !statusFilter.value || g.status === statusFilter.value;
    const matchesImage = !withImageOnly.value || !!g.image_url;
    return matchesQ && matchesStatus && matchesImage;
  });
});

function resetGameFilters() {
  qGames.value = "";
  statusFilter.value = "";
  withImageOnly.value = false;
}

/* --------- Filtrering: Ordrar ---------- */
const qOrders = ref("");
const typeFilter = ref("");

const filteredOrders = computed(() => {
  const q = qOrders.value.trim().toLowerCase();
  return allOrders.value.filter((o) => {
    const matchesQ =
      !q ||
      o.buyerName?.toLowerCase().includes(q) ||
      o.gameTitle?.toLowerCase().includes(q);
    const matchesType = !typeFilter.value || o.type === typeFilter.value;
    return matchesQ && matchesType;
  });
});

function resetOrderFilters() {
  qOrders.value = "";
  typeFilter.value = "";
}

/* ---------- UI helpers ---------- */
function badgeClass(status) {
  switch (status) {
    case "available":
      return "success";
    case "reserved":
    case "rented":
      return "warn";
    case "sold":
    case "blocked":
      return "danger";
    default:
      return "";
  }
}

function formatDateTime(dt) {
  // Enkel formattering som funkar med ISO eller SQL-datumsträngar
  try {
    const d = new Date(dt);
    if (isNaN(d.getTime())) return dt;
    return d.toLocaleString();
  } catch {
    return dt;
  }
}

/* ---------- API ---------- */
async function loadAdminData() {
  isLoading.value = true;
  try {
    const [gamesRes, ordersRes] = await Promise.all([
      api.get("/admin/games"),
      api.get("/admin/orders"),
    ]);
    allGames.value = gamesRes.data;
    allOrders.value = ordersRes.data;
  } catch (err) {
    console.error(err);
    toast.push("Kunde inte ladda admin-data", "error");
  } finally {
    isLoading.value = false;
  }
}

async function blockGame(g) {
  try {
    busyId.value = g.id;
    await api.put(`/admin/games/${g.id}`, { status: "blocked" });
    toast.push(`Annons ${g.id} blockerad`, "success");
    await loadAdminData();
  } catch (err) {
    console.error(err);
    toast.push("Kunde inte blockera annons", "error");
  } finally {
    busyId.value = null;
  }
}

async function unblockGame(g) {
  try {
    busyId.value = g.id;
    await api.put(`/admin/games/${g.id}`, { status: "available" });
    toast.push(`Annons ${g.id} upplåst`, "success");
    await loadAdminData();
  } catch (err) {
    console.error(err);
    toast.push("Kunde inte låsa upp annons", "error");
  } finally {
    busyId.value = null;
  }
}

/* ---------- Lifecycle ---------- */
onMounted(() => {
  if (!auth.isLoggedIn) {
    router.push("/login");
    return;
  }
  if (!isAdmin.value) return;
  loadAdminData();
});
</script>

<style scoped>
/* Filterrad: grid som flyter fint på små skärmar */
.filters {
  display: grid;
  grid-template-columns: 1fr 180px auto auto;
  gap: var(--space-md);
  align-items: end;
  margin-bottom: var(--space-md);
}
@media (max-width: 900px) {
  .filters {
    grid-template-columns: 1fr;
    align-items: stretch;
  }
}

.checkbox {
  grid-column: 1 / 2; /* samma kolumn som sök */
  align-self: start;
  margin-top: 0.35rem; /* liten luft under inputen */
}

.thumb {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 0.5rem;
  border: 1px solid var(--border-color);
}

/* Åtgärdsknappcell, wrap på små skärmar */
.actions-cell {
  min-width: 140px;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

/* Empty state */
.empty {
  border: 1px dashed var(--border-color);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  text-align: center;
  margin-top: var(--space-md);
  color: var(--text-dim);
}

/* --------- Responsiva tabeller (stacked på små skärmar) --------- */
.stacked-table {
  width: 100%;
  border-collapse: collapse;
}
.stacked-table thead th {
  position: sticky;
  top: 0;
  background: rgba(255, 255, 255, 0.03);
}

/* Stacka till kort på ≤ 720px */
@media (max-width: 720px) {
  .stacked-table thead {
    display: none;
  }
  .stacked-table tbody tr {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.25rem;
    padding: var(--space-md);
    margin-bottom: var(--space-md);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-lg);
    background: var(--bg-card);
  }
  .stacked-table tbody td {
  }
  .stacked-table tbody td::before {
    content: attr(data-label);
    font-weight: 600;
    color: var(--text-dim);
    padding-right: 0.75rem;
  }
  .actions-cell {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
}

/* Lite tätare tabell på stora skärmar */
@media (min-width: 721px) {
  .stacked-table th,
  .stacked-table td {
    padding: 0.6rem 0.75rem;
  }
}

.select {
  position: relative;
}
.select-reset {
  appearance: none;
  -webkit-appearance: none;
  padding-right: 2.1rem !important; /* luft mellan text och pil/kant */
}
.select::after {
  content: "▾";
  position: absolute;
  right: 0.6rem; /* flytta pilen från högra kanten */
  top: 70%;
  transform: translateY(-50%);
  font-size: 0.9rem;
  color: var(--text-dim);
  pointer-events: none;
}
</style>
