<template>
  <section class="row" style="gap:2rem;">
    <header class="row" style="gap:.5rem;">
      <h1 class="card-title">Mina köp & hyror</h1>
      <p class="card-sub">Här ser du alla beställningar du gjort.</p>
    </header>

    <div v-if="!auth.isLoggedIn" class="card">
      <div class="card-title">Du måste vara inloggad</div>
      <div class="card-sub">Logga in för att se dina ordrar.</div>
    </div>

    <div v-else class="card table-wrapper">
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
          <tr v-for="o in orders" :key="o.id">
            <td>
              <div style="font-weight:500; color:var(--text-main);">
                {{ o.gameTitle }}
              </div>
              <div class="card-sub" style="font-size:.7rem;">
                {{ o.platform }}
              </div>
            </td>

            <td>
              <span class="badge" :class="o.type === 'buy' ? 'success' : 'warn'">
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
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api.js'
import { useAuthStore } from '../store/auth.js'
import { useToastStore } from '../store/toast.js'

const auth = useAuthStore()
const toast = useToastStore()
const router = useRouter()

const orders = ref([])

async function loadOrders() {
  try {
    const res = await api.get('/orders/me')
    orders.value = res.data
  } catch (err) {
    console.error(err)
    toast.push('Kunde inte hämta dina beställningar', 'error')
  }
}

onMounted(() => {
  if (!auth.isLoggedIn) {
    router.push('/login')
    return
  }
  loadOrders()
})
</script>
