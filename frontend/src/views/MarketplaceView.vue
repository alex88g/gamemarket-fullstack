<!-- src/views/MarketplaceView.vue -->
<template>
  <section class="row" style="gap: 2rem">
    <header class="row" style="gap: 0.5rem">
      <h1 class="card-title">Marknad</h1>
      <p class="card-sub">Köp eller hyr spel från andra användare.</p>
    </header>

    <div class="card" style="display:flex; flex-wrap:wrap; gap:1rem; align-items:center;">
      <input
        v-model="search"
        class="input-field"
        placeholder="Sök spel eller plattform..."
        style="max-width:250px;"
      />
      <select v-model="sortKey" class="input-field" style="max-width:200px;">
        <option value="title">Sortera: Titel (A–Ö)</option>
        <option value="price_low">Lägsta pris först</option>
        <option value="price_high">Högsta pris först</option>
      </select>
    </div>

    <div v-if="!hasAnyGames && !hasQuery" class="card">
      <div class="card-title">Inga annonser ännu</div>
      <div class="card-sub">Var först med att lägga upp ett spel!</div>
    </div>

    <div v-else-if="hasAnyGames && hasQuery && filteredGames.length === 0" class="card">
      <div class="card-title">Inga träffar</div>
      <div class="card-sub">Justera sökningen eller rensa filtret.</div>
    </div>

    <div v-else class="row" style="gap: 1rem">
      <GameCard
        v-for="g in filteredGames"
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
import { ref, onMounted, computed } from "vue";
import api from "../api.js";
import GameCard from "../components/GameCard.vue";
import BuyRentModal from "../components/BuyRentModal.vue";
import { useToastStore } from "../store/toast.js";

const games = ref([]);
const showModal = ref(false);
const modalMode = ref("buy"); // 'buy' | 'rent'
const selectedGame = ref(null);

const search = ref("")
const sortKey = ref("title")

const filteredGames = computed(() => {
  const q = search.value.toLowerCase()
  let list = games.value.filter((g) =>
    g.title.toLowerCase().includes(q) ||
    g.platform.toLowerCase().includes(q)
  )
  switch (sortKey.value) {
    case "price_low":
      list = [...list].sort((a, b) => (a.price_sell ?? 0) - (b.price_sell ?? 0))
      break
    case "price_high":
      list = [...list].sort((a, b) => (b.price_sell ?? 0) - (a.price_sell ?? 0))
      break
    case "title":
      list = [...list].sort((a, b) => a.title.localeCompare(b.title))
      break
  }
  return list
})

const hasQuery = computed(() => search.value.trim().length > 0)
const hasAnyGames = computed(() => games.value.length > 0)

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
