<template>
  <section class="card" v-if="auth.isLoggedIn">
    <div class="card-header">
      <div>
        <div class="card-title">Min profil</div>
        <div class="card-sub">Visa och uppdatera dina uppgifter</div>
      </div>
    </div>

    <div class="row">
      <div v-if="loading">Laddar...</div>

      <template v-else>
        <div class="input-group">
          <label class="input-label" for="username">Användarnamn</label>
          <input id="username" class="input-field" v-model="username" />
        </div>

        <div class="input-group">
          <label class="input-label" for="email">E-post</label>
          <input id="email" class="input-field" type="email" v-model="email" />
        </div>

        <div class="row-2col" style="margin-top: 0.5rem">
          <button
            class="btn primary"
            :disabled="!dirty || saving"
            @click="save"
          >
            {{ saving ? "Sparar…" : "Spara ändringar" }}
          </button>
          <button class="btn danger" @click="removeAccount">
            Radera konto
          </button>
        </div>
      </template>
    </div>
  </section>

  <section class="card" v-else>
    <div class="card-title">Inte inloggad</div>
    <div class="card-sub">Logga in för att se din profil.</div>
  </section>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import api from "../api.js";
import { useAuthStore } from "../store/auth.js";
import { useToastStore } from "../store/toast.js";

const auth = useAuthStore();
const toast = useToastStore();

const username = ref("");
const email = ref("");
const loading = ref(true);
const saving = ref(false);

const dirty = computed(
  () =>
    username.value !== (auth.user?.username || "") ||
    email.value !== (auth.user?.email || ""),
);

async function loadMe() {
  try {
    // Hämta användare från DB istället för auth
    const { data } = await api.get("/user/me");
    username.value = data.username || "";
    email.value = data.email || "";
    auth.user = { ...auth.user, ...data };
  } catch (err) {
    console.error(err);
    toast.push("Kunde inte hämta profil", "error");
  } finally {
    loading.value = false;
  }
}

async function save() {
  if (!dirty.value) return;
  saving.value = true;
  try {
    const { data } = await api.put("/user/me", {
      username: username.value,
      email: email.value,
    });
    // Uppdatera auth och input fields
    auth.user = { ...auth.user, ...data };
    username.value = data.username;
    email.value = data.email;
    toast.push("Sparat ✅", "success");
  } catch (err) {
    const msg = err?.response?.data?.message || "Kunde inte spara";
    toast.push(msg, "error");
  } finally {
    saving.value = false;
  }
}

async function removeAccount() {
  if (!confirm("Är du säker? Detta går inte att ångra.")) return;
  try {
    await api.delete("/user/me");
    auth.logout();
    toast.push("Kontot raderat", "success");
    window.location.href = "/";
  } catch (err) {
    console.error(err);
    toast.push("Kunde inte radera konto", "error");
  }
}

onMounted(loadMe);
</script>
