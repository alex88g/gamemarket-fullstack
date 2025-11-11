<template>
  <section class="row" style="gap: 2rem">
    <header class="row" style="gap: 0.5rem">
      <h1 class="card-title">Mina köp & hyror</h1>
      <p class="card-sub">Här ser du alla beställningar du gjort.</p>
    </header>

    <div v-if="!auth.isLoggedIn" class="card">
      <div class="card-title">Du måste vara inloggad</div>
      <div class="card-sub">Logga in för att se dina ordrar.</div>
    </div>

    <div v-else class="card">
      <!-- Filter + sortering ligger INNE i v-else-card -->
      <div class="row" style="gap: 0.75rem; margin-bottom: 1rem">
        <div class="input-group" style="flex: 1 1 220px">
          <label class="input-label">Sök i dina ordrar</label>
          <input
            class="input-field"
            v-model="searchQuery"
            placeholder="Sök på spel, plattform eller typ..."
          />
        </div>

        <div class="input-group" style="width: 220px">
          <label class="input-label">Sortera</label>
          <select class="input-field" v-model="sortOrder">
            <option value="newest">Nyast först</option>
            <option value="oldest">Äldst först</option>
          </select>
        </div>
      </div>

      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Spel</th>
              <th>Typ</th>
              <th>Pris totalt</th>
              <th>Period</th>
              <th>Datum</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="o in filteredOrders" :key="o.id">
              <td>
                <div style="font-weight: 500; color: var(--text-main)">
                  {{ o.gameTitle }}
                </div>
                <div class="card-sub" style="font-size: 0.7rem">
                  {{ o.platform }}
                </div>
              </td>

              <td>
                <span
                  class="badge"
                  :class="o.type === 'buy' ? 'success' : 'warn'"
                >
                  {{ o.type }}
                </span>
              </td>

              <td>{{ o.total_price }} kr</td>

              <td>
                <div v-if="o.type === 'rent'">
                  <div class="card-sub">{{ o.rental_months }} mån</div>
                </div>
                <div v-else>-</div>
              </td>

              <td class="card-sub">{{ o.created_at }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import api from "../api.js";
import { useAuthStore } from "../store/auth.js";
import { useToastStore } from "../store/toast.js";

const auth = useAuthStore();
const toast = useToastStore();
const router = useRouter();

const orders = ref([]);

const searchQuery = ref("");
const sortOrder = ref("newest");

const filteredOrders = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();

  let list = orders.value.filter((o) => {
    if (!q) return true;

    const title = o.gameTitle?.toLowerCase() || "";
    const platform = o.platform?.toLowerCase() || "";
    const type = o.type?.toLowerCase() || "";

    return title.includes(q) || platform.includes(q) || type.includes(q);
  });

  list = [...list].sort((a, b) => {
    const da = new Date(a.created_at);
    const db = new Date(b.created_at);

    if (sortOrder.value === "oldest") {
      return da - db; // äldst först
    }
    return db - da; // nyast först
  });

  return list;
});

async function loadOrders() {
  try {
    const res = await api.get("/orders/me");
    orders.value = res.data;
  } catch (err) {
    console.error(err);
    toast.push("Kunde inte hämta dina beställningar", "error");
  }
}

onMounted(() => {
  if (!auth.isLoggedIn) {
    router.push("/login");
    return;
  }
  loadOrders();
});
</script>
