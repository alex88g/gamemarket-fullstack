<!-- src/components/CartDrawer.vue -->
<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-card" style="max-width:560px;">
      <header class="row" style="gap:.25rem;">
        <div class="card-title" style="display:flex;justify-content:space-between;align-items:flex-start;">
          <span>Kundvagn</span>
          <div style="display:flex;gap:.5rem;">
            <button class="btn" @click="$emit('close')">Stäng</button>
            <button class="btn danger" @click="clear" :disabled="cart.loading || cart.count===0">Töm</button>
          </div>
        </div>
        <div class="card-sub">Granska dina val innan betalning</div>
      </header>

      <div class="row" style="gap:1rem;">
        <div v-if="cart.count===0" class="card-sub">Korgen är tom.</div>

        <div v-for="it in cart.items" :key="it.id" class="card" style="display:grid;grid-template-columns:64px 1fr auto;gap:.75rem;align-items:center;">
          <img v-if="it.image_url" :src="it.image_url" alt="" style="width:64px;height:64px;border-radius:.5rem;object-fit:cover;border:1px solid var(--border-color);" />
          <div>
            <div style="font-weight:600;">{{ it.title }}</div>
            <div class="card-sub" style="font-size:.75rem;">{{ it.platform }} • av {{ it.ownerName }}</div>
            <div class="card-sub" style="font-size:.75rem;">
              <template v-if="it.type==='buy'">
                Köp – {{ it.price_sell }} kr
              </template>
              <template v-else>
                Hyra – {{ it.rental_months }} mån × {{ it.price_rent_per_month }} kr/mån = <strong>{{ it.rental_months * it.price_rent_per_month }} kr</strong>
              </template>
            </div>
          </div>
          <button class="btn danger" @click="remove(it.id)">Ta bort</button>
        </div>

        <div v-if="cart.count>0" class="row" style="gap:.5rem;">
          <div class="card-sub"><strong>Summa:</strong> {{ cart.total }} kr</div>
          <button class="btn primary" :disabled="cart.loading" @click="checkoutNow">
            Bekräfta betalning
          </button>
          <p v-if="err" style="color:#fca5a5;font-size:.8rem;margin:0;">{{ err }}</p>
          <p v-if="note" class="card-sub" style="margin:0;">{{ note }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useCartStore } from '../store/cart.js'
import { useToastStore } from '../store/toast.js'
import { useRouter } from 'vue-router'

const cart = useCartStore()
const toast = useToastStore()
const router = useRouter()

const err = ref('')
const note = ref('')

onMounted(() => {
  cart.fetch()
})

async function remove(id) {
  await cart.remove(id)
  toast.push('Borttagen från korgen', 'info')
}

async function clear() {
  await cart.clear()
  toast.push('Korgen tömd', 'info')
}

async function checkoutNow() {
  err.value = ''
  note.value = ''
  try {
    const result = await cart.checkout() // { created, errors }
    if (result.created?.length) {
      toast.push('✅ Betalning genomförd', 'success')
      // visa ev. fel för sådant som inte gick igenom
      if (result.errors?.length) {
        note.value = `Vissa artiklar kunde inte köpas/hyras (${result.errors.length} st).`
      }
      // gå till Mina köp
      router.push('/orders')
    } else {
      // inga ordrar skapades
      if (result.errors?.length) {
        err.value = 'Kunde inte slutföra någon av artiklarna. Prova igen.'
      } else {
        err.value = 'Ingenting att betala.'
      }
    }
  } catch (e) {
    console.error(e)
    err.value = 'Kunde inte slutföra betalningen.'
  }
}
</script>
