<!-- src/views/MarketplaceView.vue -->
<template>
  <section class="row" style="gap: 2rem">
    <header class="row" style="gap: 0.5rem">
      <h1 class="card-title">Marknad</h1>
      <p class="card-sub">Köp eller hyr spel från andra användare.</p>
    </header>

    <div class="row" style="gap: 1rem">
      <GameCard
        v-for="g in games"
        :key="g.id"
        :game="g"
        @buy="openBuy(g)"
        @rent="openRent(g)"
      />
    </div>
  </section>

  <BuyRentModal
    v-if="showModal"
    :game="selectedGame"
    :mode="modalMode"
    @close="closeModal"
    @done="handleDone"
  />
</template>

<script setup>
import { ref, onMounted } from "vue";
import api from "../api.js";
import GameCard from "../components/GameCard.vue";
import BuyRentModal from "../components/BuyRentModal.vue";
import { useToastStore } from "../store/toast.js";

const games = ref([]);
const showModal = ref(false);
const modalMode = ref("buy"); // 'buy' | 'rent'
const selectedGame = ref(null);

const toast = useToastStore();

async function refresh() {
  try {
    const res = await api.get("/games");
    // visa inte annonser som är blockerade
    games.value = res.data.filter((g) => g.status !== "blocked");
  } catch (err) {
    console.error(err);
    toast.push("Kunde inte hämta spel", "error");
  }
}

function openBuy(game) {
  selectedGame.value = game;
  modalMode.value = "buy";
  showModal.value = true;
}

function openRent(game) {
  selectedGame.value = game;
  modalMode.value = "rent";
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
  selectedGame.value = null;
}

async function handleDone() {
  // ladda om listan efter köp/hyra så status uppdateras
  await refresh();
}

onMounted(() => {
  refresh();
});
</script>
