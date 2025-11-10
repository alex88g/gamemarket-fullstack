<template>
  <div class="dashboard">
    <header class="header">
      <h1>🧭 Fantasy Game Analytics</h1>
      <p>Explore realms, player growth, and ratings across the multiverse.</p>
    </header>

    <!-- Game Cards -->
    <section class="cards">
      <div class="card" v-for="game in games" :key="game.id">
        <img :src="game.image" :alt="game.name" class="card-image" />

        <div class="card-content">
          <h2 class="game-title">{{ game.name }}</h2>
          <p class="meta">{{ game.genre }} • {{ game.platform }}</p>
          <p class="rating">
            Rating: <strong>{{ game.rating }}/10</strong>
          </p>
          <p class="players">
            Players:
            {{ game.stats[game.stats.length - 1].value.toLocaleString() }}
          </p>

          <!-- Chart without labels -->
          <div class="chart">
            <div
              v-for="point in game.stats"
              :key="point.month"
              class="chart-bar"
            >
              <div
                class="chart-fill"
                :style="{ height: (point.value / maxStatValue) * 100 + '%' }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Statistics -->
    <section class="stats">
      <h3>📊 Global Realm Insights</h3>
      <table>
        <thead>
          <tr>
            <th>Game</th>
            <th>Avg Players</th>
            <th>Peak Month</th>
            <th>Growth</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="game in games" :key="game.name">
            <td>{{ game.name }}</td>
            <td>{{ avg(game.stats).toLocaleString() }}</td>
            <td>{{ peakMonth(game.stats) }}</td>
            <td>
              <div class="growth-bar">
                <div
                  class="growth-fill"
                  :style="{ width: growth(game.stats).toFixed(1) + '%' }"
                ></div>
                <span>{{ growth(game.stats).toFixed(1) }}%</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
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
      "https://cdn.mos.cms.futurecdn.net/MQKqAyj3Un8CFMWtwzEEmX-1200-80.jpg",
    stats: [
      { month: "Jan", value: 820 },
      { month: "Feb", value: 1040 },
      { month: "Mar", value: 1280 },
      { month: "Apr", value: 1160 },
      { month: "May", value: 1480 },
    ],
  },
  {
    id: 2,
    name: "Star Dominion",
    genre: "4X Strategy",
    platform: "PC / Xbox",
    rating: 8.7,
    image:
      "https://cdn1.epicgames.com/offer/7a2f74a6a5f141fc910c879d2c891a62/EGS_Homeworld3_BlackbirdInteractive_S1_2560x1440-8a4b3c51a20e75e19e14b6c146ed20c2",
    stats: [
      { month: "Jan", value: 580 },
      { month: "Feb", value: 720 },
      { month: "Mar", value: 690 },
      { month: "Apr", value: 920 },
      { month: "May", value: 980 },
    ],
  },
  {
    id: 3,
    name: "Echoes of Eternity",
    genre: "Fantasy MMO",
    platform: "PC",
    rating: 9.0,
    image:
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/233860/header.jpg",
    stats: [
      { month: "Jan", value: 1220 },
      { month: "Feb", value: 1320 },
      { month: "Mar", value: 1270 },
      { month: "Apr", value: 1540 },
      { month: "May", value: 1650 },
    ],
  },
  {
    id: 4,
    name: "Legends Reborn",
    genre: "Adventure Fantasy",
    platform: "PC / Switch",
    rating: 9.4,
    image:
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1245620/header_alt_assets_2.jpg",
    stats: [
      { month: "Jan", value: 1300 },
      { month: "Feb", value: 1450 },
      { month: "Mar", value: 1550 },
      { month: "Apr", value: 1700 },
      { month: "May", value: 1820 },
    ],
  },
];

const maxStatValue = Math.max(
  ...games.flatMap((g) => g.stats.map((s) => s.value)),
);
const avg = (stats) => stats.reduce((a, s) => a + s.value, 0) / stats.length;
const peakMonth = (stats) =>
  stats.reduce((a, b) => (b.value > a.value ? b : a)).month;
const growth = (stats) =>
  ((stats[stats.length - 1].value - stats[0].value) / stats[0].value) * 100;
</script>

<style scoped>
.dashboard {
  background: #0f1117;
  color: #f3f3f3;
  min-height: 100vh;
  font-family: "Inter", sans-serif;
  padding: 40px 80px;
  box-sizing: border-box;
}

/* Header */
.header {
  text-align: center;
  margin-bottom: 40px;
}
.header h1 {
  color: #00c896;
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 10px;
}
.header p {
  color: #b3b3b3;
}

/* Card layout */
.cards {
  display: flex;
  flex-direction: column;
  gap: 28px;
  align-items: center; /* center the cards so they don't span full width */
}
.card {
  display: flex;
  background: #1c1f24;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.4);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}
.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 200, 150, 0.2);
}
.card {
  /* make cards narrower and center them */
  width: 100%;
  max-width: 980px;
  margin: 0 auto;
}

.card-image {
  width: 180px;
  height: 180px;
  object-fit: cover;
  border-radius: 16px 0 0 16px;
}
.card-content {
  padding: 18px;
  flex: 1;
}
.game-title {
  color: #00ffc3;
  font-size: 1.4rem;
  margin-bottom: 6px;
}
.meta {
  color: #b0b0b0;
  margin-bottom: 10px;
}
.rating,
.players {
  color: #e6e6e6;
  margin-bottom: 8px;
  font-size: 0.95rem;
}

/* Chart section */
.chart {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  height: 56px;
  margin-top: 10px;
}
.chart-bar {
  flex: 1;
  display: flex;
  justify-content: center;
}
.chart-fill {
  width: 10px;
  background: linear-gradient(to top, #00c896, #00ffb0);
  border-radius: 4px;
  transition: height 0.3s ease;
}

/* Stats section */
.stats {
  margin-top: 60px;
  background: #181b20;
  border-radius: 16px;
  padding: 30px;
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.4);
}
.stats h3 {
  font-size: 1.6rem;
  color: #00c896;
  margin-bottom: 20px;
}
.stats table {
  width: 100%;
  border-collapse: collapse;
}
.stats th,
.stats td {
  padding: 12px;
  border-bottom: 1px solid #2b2f35;
  text-align: left;
}
.stats th {
  color: #999;
  font-weight: 500;
}
.stats td {
  color: #eaeaea;
}
.growth-bar {
  display: flex;
  align-items: center;
  gap: 10px;
}
.growth-fill {
  height: 8px;
  background: linear-gradient(to right, #00ffb2, #00c896);
  border-radius: 4px;
  transition: width 0.3s ease;
  min-width: 5px;
}
.growth-bar span {
  font-size: 0.8rem;
  color: #aaa;
}
</style>
