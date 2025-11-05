<template>
  <div class="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 text-white p-8">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-10">
      <h1 class="text-4xl font-bold tracking-tight mb-4 md:mb-0">🎮 Game Dashboard</h1>
      <div class="flex gap-4">
        <div class="bg-gray-800/70 backdrop-blur-sm px-4 py-2 rounded-lg shadow-md text-center">
          <p class="text-sm text-gray-400">Total Games</p>
          <p class="text-xl font-semibold text-emerald-400">{{ games.length }}</p>
        </div>
        <div class="bg-gray-800/70 backdrop-blur-sm px-4 py-2 rounded-lg shadow-md text-center">
          <p class="text-sm text-gray-400">Avg Rating</p>
          <p class="text-xl font-semibold text-emerald-400">{{ avgRating.toFixed(1) }}</p>
        </div>
      </div>
    </div>

    <!-- Game Grid -->
    <div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <div
        v-for="game in games"
        :key="game.id"
        class="bg-gray-900/80 backdrop-blur-sm rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 flex flex-col"
      >
        <img
          :src="game.image"
          :alt="game.name"
          class="w-full h-48 object-cover"
        />

        <div class="p-5 flex flex-col flex-1">
          <h2 class="text-xl font-semibold mb-1">{{ game.name }}</h2>
          <p class="text-sm text-gray-400 mb-3">
            {{ game.genre }} • {{ game.platform }}
          </p>

          <!-- Rating -->
          <div class="flex items-center justify-between mb-4">
            <span class="text-sm text-gray-400">Rating</span>
            <span
              class="font-bold text-lg"
              :class="{
                'text-emerald-400': game.rating >= 9,
                'text-yellow-400': game.rating < 9 && game.rating >= 7,
                'text-red-400': game.rating < 7,
              }"
            >
              {{ game.rating }}/10
            </span>
          </div>

          <!-- Manual “chart” -->
          <div class="relative bg-gray-800 rounded-lg p-3 h-32 flex items-end justify-between overflow-hidden">
            <!-- Gradient glow -->
            <div class="absolute inset-0 bg-gradient-to-t from-gray-800 to-transparent opacity-40 pointer-events-none"></div>

            <div
              v-for="point in game.stats"
              :key="point.month"
              class="flex flex-col items-center flex-1 mx-1 z-10"
            >
              <div
                class="w-3 rounded-t bg-gradient-to-t from-emerald-600 to-emerald-400 shadow-lg"
                :style="{ height: `${(point.value / maxStatValue) * 100}%` }"
              ></div>
              <span class="text-[10px] text-gray-400 mt-1">{{ point.month }}</span>
            </div>
          </div>

          <!-- Small summary -->
          <div class="text-xs text-gray-500 text-right mt-2">
            ↑ {{ game.stats[game.stats.length - 1].value }} active players
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const games = [
  {
    id: 1,
    name: "Cyber Horizon",
    genre: "Action RPG",
    platform: "PC / PS5",
    rating: 9.2,
    image:
      "https://images.unsplash.com/photo-1606813902735-86c4d7daea4d?auto=format&fit=crop&w=800&q=80",
    stats: [
      { month: "Jan", value: 800 },
      { month: "Feb", value: 1000 },
      { month: "Mar", value: 1200 },
      { month: "Apr", value: 1100 },
      { month: "May", value: 1400 },
    ],
  },
  {
    id: 2,
    name: "Star Dominion",
    genre: "Strategy",
    platform: "PC / Xbox",
    rating: 8.7,
    image:
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80",
    stats: [
      { month: "Jan", value: 500 },
      { month: "Feb", value: 700 },
      { month: "Mar", value: 650 },
      { month: "Apr", value: 900 },
      { month: "May", value: 950 },
    ],
  },
  {
    id: 3,
    name: "Echoes of Eternity",
    genre: "Fantasy MMO",
    platform: "PC",
    rating: 9.0,
    image:
      "https://images.unsplash.com/photo-1627856014977-44f5f0df75f1?auto=format&fit=crop&w=800&q=80",
    stats: [
      { month: "Jan", value: 1200 },
      { month: "Feb", value: 1300 },
      { month: "Mar", value: 1250 },
      { month: "Apr", value: 1500 },
      { month: "May", value: 1600 },
    ],
  },
  {
    id: 4,
    name: "Solar Strikers",
    genre: "Sci-Fi Shooter",
    platform: "PS5 / Xbox",
    rating: 8.5,
    image:
      "https://images.unsplash.com/photo-1635323718990-5d2c5e3bfc5b?auto=format&fit=crop&w=800&q=80",
    stats: [
      { month: "Jan", value: 900 },
      { month: "Feb", value: 950 },
      { month: "Mar", value: 1000 },
      { month: "Apr", value: 1100 },
      { month: "May", value: 1250 },
    ],
  },
  {
    id: 5,
    name: "Legends Reborn",
    genre: "Fantasy Adventure",
    platform: "PC / Switch",
    rating: 9.4,
    image:
      "https://images.unsplash.com/photo-1623059754140-38b41a8f5d11?auto=format&fit=crop&w=800&q=80",
    stats: [
      { month: "Jan", value: 1300 },
      { month: "Feb", value: 1450 },
      { month: "Mar", value: 1550 },
      { month: "Apr", value: 1700 },
      { month: "May", value: 1800 },
    ],
  },
];

// Compute max and average rating
const maxStatValue = Math.max(...games.flatMap((g) => g.stats.map((s) => s.value)));
const avgRating = games.reduce((acc, g) => acc + g.rating, 0) / games.length;
</script>

<style>
::-webkit-scrollbar {
  width: 8px;
}
::-webkit-scrollbar-thumb {
  background: #374151;
  border-radius: 9999px;
}
</style>
