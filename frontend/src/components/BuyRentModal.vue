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
          <span v-if="mode === 'buy'">Lägg i kundvagn</span>
          <span v-else>Hyra spel – lägg i kundvagn</span>

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
              Varans status ändras först vid betalning i kassan.
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
            <p class="card-sub" style="font-size:.75rem; margin:.25rem 0 0;">
              Status ändras till <em>rented</em> först vid betalning i kassan.
            </p>
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
          style="min-width:160px; justify-content:center;"
          :disabled="loading"
          @click="addToCart"
        >
          <span v-if="!loading && mode==='buy'">Lägg i kundvagn</span>
          <span v-else-if="!loading && mode==='rent'">Lägg i kundvagn</span>
          <span v-else>Lägger till…</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useToastStore } from '../store/toast.js'
import { useCartStore } from '../store/cart.js'

const props = defineProps({
  game: { type: Object, required: true },
  mode: { type: String, default: 'buy' }, // 'buy' | 'rent'
})

const emit = defineEmits(['close', 'done'])

const toast = useToastStore()
const cart = useCartStore()

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

function validate() {
  // köp måste ha säljpris
  if (props.mode === 'buy') {
    if (props.game.price_sell == null) {
      errMsg.value = 'Det här spelet är inte till salu.'
      return false
    }
    return true
  }
  // hyra måste ha månadspris + giltiga månader
  if (props.mode === 'rent') {
    if (props.game.price_rent_per_month == null) {
      errMsg.value = 'Det här spelet går inte att hyra.'
      return false
    }
    if (!months.value || months.value < 1) {
      errMsg.value = 'Välj antal månader (minst 1).'
      return false
    }
    return true
  }
  errMsg.value = 'Ogiltigt läge.'
  return false
}

async function addToCart() {
  loading.value = true
  errMsg.value = ''

  try {
    if (!validate()) {
      loading.value = false
      return
    }

    const base = {
      gameId: props.game.id,
      title: props.game.title,
      platform: props.game.platform,
      image_url: props.game.image_url || null,
      owner_id: props.game.owner_id,
      type: props.mode, // 'buy' | 'rent'
    }

    let item
    if (props.mode === 'buy') {
      item = {
        ...base,
        rental_months: null,
        unit_price: Number(props.game.price_sell),
        total_price: Number(props.game.price_sell),
        // unik nyckel per game + typ
        key: `${props.game.id}-buy`,
      }
    } else {
      const m = Number(months.value)
      item = {
        ...base,
        rental_months: m,
        unit_price: Number(props.game.price_rent_per_month),
        total_price: Number(props.game.price_rent_per_month) * m,
        // unik nyckel per game + typ + månader
        key: `${props.game.id}-rent-${m}`,
      }
    }

    cart.addItem(item)
    toast.push('✅ Tillagd i kundvagnen!', 'success')

    // be parent refresha listan om du vill (valfritt)
    emit('done')
    // stäng modalen
    emit('close')
  } catch (err) {
    console.error(err)
    errMsg.value = 'Kunde inte lägga i kundvagnen.'
    toast.push('❌ Kunde inte lägga i kundvagnen', 'error')
  } finally {
    loading.value = false
  }
}
</script>
