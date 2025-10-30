<!-- src/views/CartView.vue -->
<template>
  <section class="row" style="gap:2rem;">
    <header class="row" style="gap:.5rem;">
      <h1 class="card-title">Kundvagn</h1>
      <p class="card-sub">Granska dina val och genomför betalning.</p>
    </header>

    <div class="card" v-if="cart.count === 0">
      <div class="card-title">Korgen är tom</div>
      <div class="card-sub">Lägg till spel från Marknad.</div>
    </div>

    <div v-else class="card table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Spel</th>
            <th>Typ</th>
            <th>Pris</th>
            <th style="width:120px;"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="it in cart.items" :key="it.key">
            <td>
              <div style="font-weight:600; color:var(--text-main);">{{ it.title }}</div>
              <div class="card-sub" style="font-size:.75rem;">{{ it.platform }}</div>
            </td>
            <td>
              <span class="badge" :class="it.type==='buy' ? 'success' : 'warn'">
                {{ it.type === 'buy' ? 'Köp' : `Hyra ${it.rental_months} mån` }}
              </span>
            </td>
            <td>
              <template v-if="it.type==='buy'">
                {{ it.unit_price }} kr
              </template>
              <template v-else>
                {{ it.rental_months }} × {{ it.unit_price }} kr = <strong>{{ it.total_price }} kr</strong>
              </template>
            </td>
            <td>
              <button class="btn danger" @click="remove(it.key)">Ta bort</button>
            </td>
          </tr>
        </tbody>
      </table>

      <div style="display:flex; justify-content:space-between; align-items:center; gap:1rem; margin-top:1rem; flex-wrap:wrap;">
        <div class="card-sub"><strong>Summa:</strong> {{ cart.total }} kr</div>
        <div style="display:flex; gap:.5rem; flex-wrap:wrap;">
          <button class="btn" @click="clear">Töm korg</button>
          <button class="btn primary" :disabled="busy" @click="checkoutNow">
            <span v-if="!busy">Bekräfta betalning</span>
            <span v-else>Bearbetar…</span>
          </button>
        </div>
      </div>

      <p v-if="errMsg" style="color:#fca5a5; font-size:.8rem; margin:.75rem 0 0;">{{ errMsg }}</p>
      <p v-if="noteMsg" class="card-sub" style="margin:.25rem 0 0;">{{ noteMsg }}</p>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../store/cart.js'
import { useToastStore } from '../store/toast.js'
import { useAuthStore } from '../store/auth.js'

const cart = useCartStore()
const toast = useToastStore()
const auth = useAuthStore()
const router = useRouter()

const busy = ref(false)
const errMsg = ref('')
const noteMsg = ref('')

onMounted(() => {
  if (!auth.isLoggedIn) {
    router.push('/login')
    return
  }
  cart.loadFromStorage()
})

function remove(key) {
  cart.remove(key)
  toast.push('Borttagen från korgen', 'info')
}
function clear() {
  cart.clear()
  toast.push('Korgen tömd', 'info')
}

async function checkoutNow() {
  errMsg.value = ''
  noteMsg.value = ''
  busy.value = true
  try {
    const result = await cart.checkout() // { created, errors }
    if (result.created?.length) {
      toast.push('✅ Betalning genomförd', 'success')
      if (result.errors?.length) {
        noteMsg.value = `Vissa artiklar misslyckades (${result.errors.length} st).`
      }
      router.push('/orders')
    } else {
      errMsg.value = result.errors?.length
        ? 'Kunde inte slutföra någon artikel.'
        : 'Ingenting att betala.'
    }
  } catch (e) {
    console.error(e)
    errMsg.value = 'Kunde inte slutföra betalningen.'
  } finally {
    busy.value = false
  }
}
</script>
