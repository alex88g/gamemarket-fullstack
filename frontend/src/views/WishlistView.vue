<template>
  <section class="row" style="gap: 2rem">
    <header class="row" style="gap: 0.5rem">
      <h1 class="card-title">Önskelista</h1>
      <p class="card-sub">Spel du vill hålla koll på.</p>
    </header>

    <div v-if="loading" class="card">
      <div class="card-title">Laddar…</div>
    </div>

    <div v-else-if="items.length === 0" class="card">
      <div class="card-title">Tom önskelista</div>
      <div class="card-sub">Lägg till spel från Marknad.</div>
    </div>

    <div v-else class="row" style="gap: 1rem">
      <GameCard
        v-for="g in items"
        :key="g.id"
        :game="g"
        :hideWish="true"
        @buy="openBuy(g)"
        @rent="openRent(g)"
        @remove-wish="removeFromWish(g)"
      />
    </div>

    <BuyRentModal
      v-if="showModal"
      :game="selectedGame"
      :mode="modalMode"
      @close="closeModal"
      @done="handleDone"
    />
  </section>
</template>

<script setup>
import { ref, onMounted } from "vue";
import api from "../api.js";
import GameCard from "../components/GameCard.vue";
import BuyRentModal from "../components/BuyRentModal.vue";
import { useToastStore } from "../store/toast.js";

const toast = useToastStore();

const items = ref([]);
const loading = ref(true);

const showModal = ref(false);
const modalMode = ref("buy");
const selectedGame = ref(null);

async function load() {
  loading.value = true;
  try {
    const { data } = await api.get("/user/wishlist");
    items.value = data;
  } catch (err) {
    console.error(err);
    toast.push("Kunde inte hämta önskelistan", "error");
  } finally {
    loading.value = false;
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
  await load();
}

async function removeFromWish(game) {
  try {
    await api.delete(`/user/wishlist/${game.id}`);
    toast.push("Borttagen från önskelistan", "info");
    await load();
  } catch (err) {
    console.error(err);
    toast.push("Kunde inte ta bort spelet", "error");
  }
}

onMounted(load);
</script>
