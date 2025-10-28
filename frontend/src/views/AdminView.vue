<!-- src/views/AdminView.vue -->
<template>
  <section class="row" style="gap:2rem;">

    <header class="row" style="gap:.5rem;">
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
      <div class="card table-wrapper">
        <h2 class="card-title" style="margin-top:0;">Annonser (moderering)</h2>
        <p class="card-sub" style="margin-bottom:1rem;">
          Blockera olämpliga annonser. Blockerade annonser syns inte på marknaden.
        </p>

        <table>
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
            <tr v-for="g in allGames" :key="g.id">
              <td>#{{ g.id }}</td>

              <td style="min-width:160px;">
                <div style="font-weight:500; color:var(--text-main);">
                  {{ g.title }}
                </div>
                <div class="card-sub" style="font-size:.7rem;">
                  {{ g.platform }}
                </div>
              </td>

              <td style="min-width:120px;">
                <div style="font-weight:500; color:var(--text-main);">
                  {{ g.ownerName }}
                </div>
                <div class="card-sub" style="font-size:.7rem;">
                  owner_id: {{ g.owner_id }}
                </div>
              </td>

              <td>
                <span class="badge" :class="badgeClass(g.status)">
                  {{ g.status }}
                </span>
              </td>

              <td>{{ g.price_sell ?? '-' }} kr</td>
              <td>{{ g.price_rent_per_month ?? '-' }} kr</td>

              <td>
                <img
                  v-if="g.image_url"
                  :src="g.image_url"
                  :alt="g.title"
                  style="
                    width:60px;
                    height:60px;
                    object-fit:cover;
                    border-radius:.5rem;
                    border:1px solid var(--border-color);
                  "
                />
              </td>

              <td style="min-width:140px; display:flex; flex-wrap:wrap; gap:.5rem;">
                <button
                  v-if="g.status !== 'blocked'"
                  class="btn danger"
                  style="font-size:.7rem;"
                  @click="blockGame(g)"
                >
                  Blockera
                </button>

                <button
                  v-else
                  class="btn primary"
                  style="font-size:.7rem;"
                  @click="unblockGame(g)"
                >
                  Tillåt igen
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- ALLA ORDRAR -->
      <div class="card table-wrapper">
        <h2 class="card-title" style="margin-top:0;">Alla ordrar</h2>
        <p class="card-sub" style="margin-bottom:1rem;">
          Köphistorik & hyror i hela systemet.
        </p>

        <table>
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
            <tr v-for="o in allOrders" :key="o.id">
              <td>#{{ o.id }}</td>

              <td>
                <div style="font-weight:500;color:var(--text-main);">
                  {{ o.buyerName }}
                </div>
                <div class="card-sub" style="font-size:.7rem;">
                  id: {{ o.buyer_id }}
                </div>
              </td>

              <td>
                <div style="font-weight:500; color:var(--text-main);">
                  {{ o.gameTitle }}
                </div>
                <div class="card-sub" style="font-size:.7rem;">
                  gameId: {{ o.game_id }}
                </div>
              </td>

              <td>
                <span class="badge" :class="o.type === 'buy' ? 'success':'warn'">
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
    </template>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api.js'
import { useAuthStore } from '../store/auth.js'
import { useToastStore } from '../store/toast.js'

const auth = useAuthStore()
const toast = useToastStore()
const router = useRouter()

const allGames = ref([])
const allOrders = ref([])

const isAdmin = computed(() => auth.user?.role === 'admin')

function badgeClass(status) {
  switch (status) {
    case 'available': return 'success'
    case 'reserved': return 'warn'
    case 'rented': return 'warn'
    case 'sold': return 'danger'
    case 'blocked': return 'danger'
    default: return ''
  }
}

async function loadAdminData() {
  try {
    const [gamesRes, ordersRes] = await Promise.all([
      api.get('/admin/games'),
      api.get('/admin/orders'),
    ])
    allGames.value = gamesRes.data
    allOrders.value = ordersRes.data
  } catch (err) {
    console.error(err)
    toast.push('Kunde inte ladda admin-data', 'error')
  }
}

async function blockGame(g) {
  try {
    await api.put(`/admin/games/${g.id}`, { status: 'blocked' })
    toast.push(`Annons ${g.id} blockerad`, 'success')
    await loadAdminData()
  } catch (err) {
    console.error(err)
    toast.push('Kunde inte blockera annons', 'error')
  }
}

async function unblockGame(g) {
  try {
    await api.put(`/admin/games/${g.id}`, { status: 'available' })
    toast.push(`Annons ${g.id} upplåst`, 'success')
    await loadAdminData()
  } catch (err) {
    console.error(err)
    toast.push('Kunde inte låsa upp annons', 'error')
  }
}

onMounted(() => {
  if (!auth.isLoggedIn) {
    router.push('/login')
    return
  }
  if (!isAdmin.value) {
    return
  }
  loadAdminData()
})
</script>
