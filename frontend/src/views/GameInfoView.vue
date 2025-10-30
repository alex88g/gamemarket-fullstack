<template>
  <div class="game-info-container">
    <!-- TODO: Replace this dummy data with a real fetch from the MySQL database -->
    <div class="game-header">
      <img
        class="game-cover"
        src="https://m.media-amazon.com/images/I/51WgV-OON1L._AC_UF894,1000_QL80_.jpg"
        alt="Shadow of the Colossus PS2 Cover"
      />
      <div class="game-details">
        <h1 class="game-title">Shadow of the Colossus (PS2)</h1>
        <p class="release-year">Release Year: 2005</p>
        <p class="genre">Genre: Action-Adventure</p>
        <p class="developer">Developer: Team Ico</p>
        <p class="description">
          Embark on an epic journey across a vast, desolate land to bring a loved one back to life. 
          Face off against towering colossi in one of the most visually and emotionally striking adventures 
          on the PlayStation 2.
        </p>
        <div class="price-section">
          <p class="price">$19.99</p>
          <button class="buy-btn">Buy</button>
          <button class="rent-btn">Rent</button>
        </div>
      </div>
    </div>

    <div class="additional-info">
      <h2>About This Game</h2>
      <p>
        "Shadow of the Colossus" is a critically acclaimed PlayStation 2 classic, known for its minimalist 
        storytelling and emotional depth. Players take on the role of Wander, a young hero who must defeat 
        16 colossal beings to restore life to a fallen girl.
      </p>
      <p>
        This is a placeholder page. Later, game information will be dynamically fetched from the MySQL 
        database using your backend API.
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: "GameInfoView",
};
</script>

<style scoped>
.game-info-container {
  max-width: 1000px;
  margin: 40px auto;
  padding: 20px;
  background: #1e1e1e;
  color: #f3f3f3;
  border-radius: 16px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.3);
  font-family: "Inter", sans-serif;
}

.game-header {
  display: flex;
  gap: 30px;
  flex-wrap: wrap;
}

.game-cover {
  width: 300px;
  height: auto;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
}

.game-details {
  flex: 1;
}

.game-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 10px;
  color: #ffffff;
}

.release-year,
.genre,
.developer {
  color: #cccccc;
  font-size: 1rem;
  margin-bottom: 4px;
}

.description {
  margin-top: 16px;
  line-height: 1.6;
}

.price-section {
  margin-top: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.price {
  font-size: 1.4rem;
  font-weight: bold;
  color: #00c896;
}

.buy-btn,
.rent-btn {
  padding: 10px 18px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.3s;
}

.buy-btn {
  background-color: #00c896;
  color: #1e1e1e;
}

.buy-btn:hover {
  background-color: #00a67a;
}

.rent-btn {
  background-color: #3a3a3a;
  color: #ffffff;
}

.rent-btn:hover {
  background-color: #555555;
}

.additional-info {
  margin-top: 40px;
}

.additional-info h2 {
  margin-bottom: 10px;
  color: #00c896;
}
</style>
