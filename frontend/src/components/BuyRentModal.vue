<!-- src/components/BuyRentModal.vue -->
<template>
  <div class="modal-overlay">
    <div class="modal-card" style="max-width:400px;">
      <!-- HEADER -->
      <header class="row" style="gap:.25rem;">
        <div
          class="card-title"
          style="display:flex; justify-content:space-between; align-items:flex-start; width:100%;"
        >
          <span v-if="mode === 'buy'">Bekräfta köp</span>
          <span v-else>Hyra spel</span>

          <button
            class="btn"
            style="font-size:.7rem; line-height:1.2; padding:.3rem .5rem;"
            @click="$emit('close')"
          >
            Stäng
          </button>
        </div>

        <div class="card-sub">
          {{ game.title }} • {{ game.platform }}
        </div>
      </header>

      <!-- BODY -->
      <div class="row" style="gap:1rem;">
        <!-- Bild om finns -->
        <img
          v-if="game.image_url"
          :src="game.image_url"
          :alt="game.title"
          style="
            width:100%;
            max-height:160px;
            object-fit:cover;
            border-radius:.5rem;
            border:1px solid var(--border-color);
            box-shadow:var(--shadow-card);
          "
        />

        <div class="card-sub" style="font-size:.8rem; white-space:pre-line;">
          {{ game.description }}
        </div>

        <!-- KÖP -->
        <div
          v-if="mode==='buy'"
          class="card"
          style="background:rgba(255,255,255,0.03); box-shadow:none;"
        >
          <div class="row" style="gap:.5rem;">
            <div class="card-sub">
              <strong>Pris:</strong>
              <span v-if="game.price_sell != null">{{ game.price_sell }} kr</span>
              <span v-else>-</span>
            </div>
            <div class="card-sub" style="font-size:.75rem;">
              När du bekräftar köpet så markeras spelet som "sold".
            </div>
          </div>
        </div>

        <!-- HYRA (per månad) -->
        <div
          v-else
          class="row"
          style="gap:1rem;"
        >
          <div class="input-group">
            <label class="input-label">Antal månader</label>
            <input
              class="input-field"
              type="number"
              min="1"
              step="1"
              v-model.number="months"
            />
            <p class="card-sub" style="font-size:.7rem; margin:0;">
              Minsta hyrestid är 1 månad.
            </p>
          </div>

          <div class="card-sub" style="font-size:.8rem;">
            <strong>Pris per månad:</strong>
            <span v-if="game.price_rent_per_month != null">
              {{ game.price_rent_per_month }} kr
            </span>
            <span v-else>-</span>
            <br />
            <template v-if="estimatedTotal !== null">
              <strong>Totalt för {{ months }} mån:</strong>
              {{ estimatedTotal }} kr
            </template>
          </div>
        </div>

        <!-- FEL / INFO -->
        <p
          v-if="errMsg"
          style="color:#fca5a5; font-size:.75rem; margin:0;"
        >
          {{ errMsg }}
        </p>
      </div>

      <!-- FOOTER / ACTION BTN -->
      <div style="display:flex; flex-wrap:wrap; gap:.75rem; justify-content:flex-end;">
        <button
          class="btn primary"
          style="min-width:120px; justify-content:center;"
          :disabled="loading"
          @click="submitOrder"
        >
          <span v-if="!loading && mode==='buy'">Bekräfta köp</span>
          <span v-else-if="!loading && mode==='rent'">Bekräfta hyra</span>
          <span v-else>Sparar...</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import api from '../api.js'
import { useToastStore } from '../store/toast.js'

const props = defineProps({
  game: { type: Object, required: true },
  mode: { type: String, default: 'buy' }, // 'buy' | 'rent'
})

const emit = defineEmits(['close', 'done'])

const toast = useToastStore()

const loading = ref(false)
const errMsg = ref('')

// HYRA per månad
const months = ref(1)

// Räkna totalpris för hyra
const estimatedTotal = computed(() => {
  if (props.mode !== 'rent') return null
  if (!props.game.price_rent_per_month) return null
  if (!months.value || months.value < 1) return null
  return Number(props.game.price_rent_per_month) * Number(months.value)
})

async function submitOrder() {
  loading.value = true
  errMsg.value = ''

  try {
    if (props.mode === 'buy') {
      // KÖP
      await api.post('/orders', {
        gameId: props.game.id,
        type: 'buy',
      })
      toast.push('✅ Köp genomfört! Kolla "Mina köp".', 'success')
    } else {
      // HYRA (per månad)
      if (!months.value || months.value < 1) {
        errMsg.value = 'Välj antal månader (minst 1).'
        loading.value = false
        return
      }

      await api.post('/orders', {
        gameId: props.game.id,
        type: 'rent',
        rental_months: months.value,
      })

      toast.push('✅ Hyresorder skapad! Kolla "Mina köp".', 'success')
    }

    // be parent refresha listan i Marknad
    emit('done')
    // stäng modalen
    emit('close')
  } catch (err) {
    console.error(err)
    errMsg.value = 'Kunde inte genomföra beställningen.'
    toast.push('❌ Kunde inte genomföra beställningen', 'error')
  } finally {
    loading.value = false
  }
}
</script>
