<template>
  <section class="row" style="gap: 2rem">
    <header class="row" style="gap: 0.5rem">
      <h1 class="card-title">Mina spelannonser</h1>
      <p class="card-sub">
        Lägg upp nya spel, ändra pris eller ta bort en annons.
      </p>
    </header>

    <!-- SKYDD: om ej inloggad -->
    <div v-if="!auth.isLoggedIn" class="card">
      <div class="card-title">Du måste vara inloggad</div>
      <div class="card-sub">Logga in för att hantera dina spel.</div>
    </div>

    <template v-else>
      <!-- SKAPA NY ANNONS -->
      <div class="card row" style="gap: 1rem">
        <div class="card-header">
          <div class="row" style="gap: 0.25rem">
            <div class="card-title">Ny annons</div>
            <div class="card-sub">Fyll i och klicka på "Spara"</div>
          </div>
        </div>

        <div class="row-2col">
          <!-- Titel -->
          <div class="input-group">
            <label class="input-label">Titel</label>
            <input class="input-field" v-model="newGame.title" />
          </div>

          <!-- Plattform -->
          <div class="input-group">
            <label class="input-label">Plattform</label>
            <select class="input-field" v-model="newGame.platform">
              <option>PS5</option>
              <option>Xbox</option>
              <option>Switch</option>
              <option>PC</option>
              <option>Other</option>
            </select>
          </div>

          <!-- Säljpris -->
          <div class="input-group">
            <label class="input-label">Säljpris (kr)</label>
            <input
              class="input-field"
              type="number"
              step="0.01"
              v-model="newGame.price_sell"
            />
          </div>

          <!-- Hyrespris -->
          <div class="input-group">
            <label class="input-label">Hyra per månad (kr)</label>
            <input
              class="input-field"
              type="number"
              step="0.01"
              v-model="newGame.price_rent_per_month"
            />
          </div>

          <!-- Bild-URL + preview -->
          <div class="input-group" style="grid-column: 1/-1">
            <label class="input-label">Bild-URL (valfritt)</label>
            <input
              class="input-field"
              v-model="newGame.image_url"
              placeholder="https://..."
            />

            <img
              v-if="newGame.image_url"
              :src="newGame.image_url"
              alt="preview"
              style="
                max-width: 120px;
                border-radius: 0.5rem;
                border: 1px solid var(--border-color);
                box-shadow: var(--shadow-card);
              "
            />
          </div>

          <!-- Beskrivning -->
          <div class="input-group" style="grid-column: 1/-1">
            <label class="input-label">Beskrivning</label>
            <textarea
              class="input-field"
              rows="3"
              v-model="newGame.description"
            />
          </div>
        </div>

        <button
          class="btn primary"
          style="max-width: max-content"
          @click="createListing"
        >
          Spara annons
        </button>
      </div>

       <!-- BEFINTLIGA ANNONSER -->
      <div class="row" style="gap: 1rem">
        <!-- Filter + sortering -->
        <div class="card row" style="gap: 0.75rem">
          <div
            class="row"
            style="gap: 1rem; align-items: flex-end; flex-wrap: wrap"
          >
            <div class="input-group" style="flex: 1 1 220px">
              <label class="input-label">Sök i dina annonser</label>
              <input
                class="input-field"
                v-model="searchQuery"
                placeholder="Sök på titel, plattform eller beskrivning..."
              />
            </div>

            <div class="input-group" style="width: 220px">
              <label class="input-label">Sortera</label>
              <select class="input-field" v-model="sortOrder">
                <option value="newest">Nyast först</option>
                <option value="oldest">Äldst först</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Lista med filtrerade + sorterade annonser -->
        <div
          v-for="g in filteredGames"
          :key="g.id"
          class="card row"
          style="gap: 1rem"
        >
          <div class="card-header">
            <div class="row" style="gap: 0.25rem">
              <div class="card-title">{{ g.title }}</div>
              <div class="card-sub">Status: {{ statusLabel(g.status) }}</div>
            </div>

            <div class="row" style="gap: 0.5rem; min-width: max-content">
              <button class="btn" @click="toggleEdit(g)">
                {{ g.editing ? "Avbryt" : "Redigera" }}
              </button>

              <button class="btn danger" @click="askDelete(g)">Ta bort</button>
            </div>
          </div>

          <!-- preview-bild för annonsen -->
          <div
            v-if="g.image_url"
            style="
              display: flex;
              align-items: flex-start;
              gap: 1rem;
              flex-wrap: wrap;
            "
          >
            <img
              :src="g.image_url"
              :alt="g.title"
              style="
                max-width: 120px;
                border-radius: 0.5rem;
                border: 1px solid var(--border-color);
                box-shadow: var(--shadow-card);
              "
            />
            <div class="card-sub" style="font-size: 0.7rem">
              Bild för '{{ g.title }}'
            </div>
          </div>

          <div class="row-2col">
            <!-- Titel -->
            <div class="input-group">
              <label class="input-label">Titel</label>
              <input
                class="input-field"
                v-model="g.title"
                :disabled="!g.editing"
              />
            </div>

            <!-- Plattform -->
            <div class="input-group">
              <label class="input-label">Plattform</label>
              <select
                class="input-field"
                v-model="g.platform"
                :disabled="!g.editing"
              >
                <option>PS5</option>
                <option>Xbox</option>
                <option>Switch</option>
                <option>PC</option>
                <option>Other</option>
              </select>
            </div>

            <!-- Säljpris -->
            <div class="input-group">
              <label class="input-label">Säljpris (kr)</label>
              <input
                class="input-field"
                type="number"
                step="0.01"
                v-model="g.price_sell"
                :disabled="!g.editing"
              />
            </div>

            <!-- Hyra per månad -->
            <div class="input-group">
              <label class="input-label">Hyra per månad (kr)</label>
              <input
                class="input-field"
                type="number"
                step="0.01"
                v-model="g.price_rent_per_month"
                :disabled="!g.editing"
              />
            </div>

            <!-- Bild-URL -->
            <div class="input-group" style="grid-column: 1/-1">
              <label class="input-label">Bild-URL</label>
              <input
                class="input-field"
                v-model="g.image_url"
                :disabled="!g.editing"
              />

              <img
                v-if="g.image_url"
                :src="g.image_url"
                alt="preview"
                style="
                  max-width: 120px;
                  border-radius: 0.5rem;
                  border: 1px solid var(--border-color);
                  box-shadow: var(--shadow-card);
                  margin-top: 0.5rem;
                "
              />
            </div>

            <!-- Beskrivning -->
            <div class="input-group" style="grid-column: 1/-1">
              <label class="input-label">Beskrivning</label>
              <textarea
                class="input-field"
                rows="3"
                v-model="g.description"
                :disabled="!g.editing"
              />
            </div>

            <!-- Status -->
            <div class="input-group" style="grid-column: 1/-1">
              <label class="input-label">Status</label>
              <select
                class="input-field"
                v-model="g.status"
                :disabled="!g.editing"
              >
                <option
                  v-for="opt in statusOptions"
                  :key="opt.value"
                  :value="opt.value"
                >
                  {{ opt.label }}
                </option>
              </select>
            </div>
          </div>

          <button
            class="btn primary"
            style="max-width: max-content"
            v-if="g.editing"
            @click="saveListing(g)"
          >
            Spara ändringar
          </button>
        </div>
      

      <!-- Tomtillstånd / inga träffar -->
        <p
          v-if="filteredGames.length === 0 && myGames.length > 0"
          class="card-sub"
        >
          Inga annonser matchade din sökning.
        </p>
        <p v-if="myGames.length === 0" class="card-sub">
          Du har inga annonser ännu. Skapa din första ovan 👆
        </p>
      </div>
    </template>

    <ConfirmModal
      v-if="showDeleteModal"
      title="Ta bort annons?"
      :message="`Vill du radera '${toDelete?.title}'? Detta går inte att ångra.`"
      @cancel="cancelDelete"
      @confirm="confirmDelete"
    />
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../store/auth.js";
import { useToastStore } from "../store/toast.js";
import api from "../api.js";
import ConfirmModal from "../components/ConfirmModal.vue";
import { statusLabel, statusOptions } from "../utils/status.js";

const auth = useAuthStore();
const toast = useToastStore();
const router = useRouter();

const allGames = ref([]);

const searchQuery = ref("");      
const sortOrder = ref("newest");  

const newGame = ref({
  title: "",
  platform: "PS5",
  description: "",
  price_sell: "",
  price_rent_per_month: "",
  image_url: "",
});

const showDeleteModal = ref(false);
const toDelete = ref(null);

/**
 * Vi returnerar samma objekt som i allGames
 * så att g.editing faktiskt funkar med v-model.
 */
const myGames = computed(() =>
  allGames.value.filter((g) => g.owner_id === auth.user?.id),
);

const filteredGames = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();

  let list = myGames.value.filter((g) => {
    if (!q) return true;

    const title = g.title?.toLowerCase() || "";
    const platform = g.platform?.toLowerCase() || "";
    const desc = g.description?.toLowerCase() || "";

    return (
      title.includes(q) ||
      platform.includes(q) ||
      desc.includes(q)
    );
  });

  if (sortOrder.value === "oldest") {
    return [...list].reverse();
  }

  return list;
});



function toggleEdit(g) {
  g.editing = !g.editing;
}

async function loadGames() {
  if (!auth.isLoggedIn) return;
  try {
    const res = await api.get("/games");
    allGames.value = res.data.map((g) => ({
      ...g,
      editing: false,
    }));
  } catch (err) {
    console.error(err);
    toast.push("Kunde inte hämta dina spel", "error");
  }
}

async function createListing() {
  if (!auth.isLoggedIn) {
    router.push("/login");
    return;
  }

  try {
    await api.post("/games", {
      title: newGame.value.title,
      platform: newGame.value.platform,
      description: newGame.value.description,
      price_sell: newGame.value.price_sell || null,
      price_rent_per_month: newGame.value.price_rent_per_month || null,
      image_url: newGame.value.image_url || null,
    });

    toast.push("Annons skapad 🎉", "success");

    // nollställ formulär
    newGame.value = {
      title: "",
      platform: "PS5",
      description: "",
      price_sell: "",
      price_rent_per_month: "",
      image_url: "",
    };

    loadGames();
  } catch (err) {
    console.error(err);
    toast.push("Kunde inte skapa annons", "error");
  }
}

function askDelete(game) {
  toDelete.value = game;
  showDeleteModal.value = true;
}
function cancelDelete() {
  showDeleteModal.value = false;
  toDelete.value = null;
}
async function confirmDelete() {
  try {
    await api.delete(`/games/${toDelete.value.id}`);
    toast.push("Annons raderad", "success");
    showDeleteModal.value = false;
    toDelete.value = null;
    loadGames();
  } catch (err) {
    console.error(err);
    toast.push("Kunde inte radera annons", "error");
  }
}

async function saveListing(game) {
  try {
    await api.put(`/games/${game.id}`, {
      title: game.title,
      platform: game.platform,
      description: game.description,
      price_sell: game.price_sell,
      price_rent_per_month: game.price_rent_per_month,
      status: game.status,
      image_url: game.image_url,
    });

    toast.push("Annons uppdaterad ✅", "success");

    loadGames();
  } catch (err) {
    console.error(err);
    toast.push("Kunde inte uppdatera annons", "error");
  }
}

onMounted(() => {
  if (!auth.isLoggedIn) {
    router.push("/login");
    return;
  }
  loadGames();
});
</script>
