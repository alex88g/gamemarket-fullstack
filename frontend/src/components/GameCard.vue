<!-- src/components/GameCard.vue -->
<template>
  <div class="card game-card">
    <!-- toppsektion: bild + titel/info + status -->
    <div class="game-top">
      <img
        v-if="game.image_url"
        class="game-thumb"
        :src="game.image_url"
        :alt="game.title"
      />

      <div class="game-headtext">
        <div class="card-title">{{ game.title }}</div>
        <div class="card-sub">
          {{ game.platform }} • upplagd av {{ game.ownerName }}
        </div>
      </div>

      <span class="badge" :class="statusClass">
        {{ statusLabel(game.status) }}
      </span>
    </div>

    <!-- beskrivning -->
    <p class="card-sub">{{ game.description }}</p>

    <!-- priser -->
    <div class="row-2col prices-row">
      <div class="card-sub">
        <strong>Säljes:</strong>
        <span v-if="game.price_sell != null">{{ game.price_sell }} kr</span>
        <span v-else>-</span>
      </div>
      <div class="card-sub">
        <strong>Hyr per månad:</strong>
        <span v-if="game.price_rent_per_month != null">{{ game.price_rent_per_month }} kr</span>
        <span v-else>-</span>
      </div>
    </div>

    <!-- knappar -->
    <div
      v-if="!isOwner && isLoggedIn"
      class="actions-row"
    >
      <button
        v-if="game.price_sell != null && game.status === 'available'"
        class="btn primary"
        @click="$emit('buy', game)"
      >
        Köp
      </button>

      <button
        v-if="game.price_rent_per_month != null && game.status === 'available'"
        class="btn"
        @click="$emit('rent', game)"
      >
        Hyr
      </button>
    </div>

    <div
      v-else-if="isOwner"
      class="card-sub"
      style="font-size:.7rem;"
    >
      (Detta är ditt spel)
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { statusLabel } from '../utils/status.js'
import { useAuthStore } from '../store/auth.js'

const props = defineProps({
  game: { type: Object, required: true }
})

const auth = useAuthStore()

const isLoggedIn = computed(() => auth.isLoggedIn)
const isOwner = computed(() => auth.user?.id === props.game.owner_id)

const statusClass = computed(() => {
  switch (props.game.status) {
    case 'available': return 'success'
    case 'reserved': return 'warn'
    case 'rented':   return 'warn'
    case 'sold':     return 'danger'
    case 'blocked':  return 'danger'
    default:         return ''
  }
})
</script>

<style scoped>
.game-card {
  display: grid;
  row-gap: .75rem;
}

/* översta raden i kortet */
.game-top {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: .75rem;
  justify-content: space-between;
}

.game-headtext {
  flex: 1 1 auto;
  min-width: 200px;
}

/* bilden */
.game-thumb {
  width: 80px;
  height: 80px;
  border-radius: .5rem;
  object-fit: cover;
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-card);
}

/* prisraden får lite mindre gap i kortet */
.prices-row {
  gap: .5rem;
}

/* knapprow */
.actions-row {
  display: flex;
  flex-wrap: wrap;
  gap: .5rem;
}
</style>
