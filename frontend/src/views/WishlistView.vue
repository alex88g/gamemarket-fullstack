<template>
  <section class="row" style="gap: 2rem">
    <header class="row" style="gap: 0.5rem">
      <h1 class="card-title">Önskelista</h1>
      <p class="card-sub">
        Här visas dina sparade spel – funktion kommer snart.
      </p>
    </header>

    <div v-if="!auth.isLoggedIn" class="card">
      <div class="card-title">Du måste vara inloggad</div>
      <div class="card-sub">Logga in för att se dina ordrar.</div>
    </div>

    <div class="card">
      <div class="card-title">Kommer snart</div>
      <div class="card-sub">Backend kopplas ihop tisdag</div>
    </div>
  </section>
</template>

<script setup>
import { useAuthStore } from "../store/auth.js";

const auth = useAuthStore();
</script>
