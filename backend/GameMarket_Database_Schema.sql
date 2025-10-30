-- =========================================================
-- GameMarket Database Schema (Create/Upgrade In-Place)
-- Version: monthly rental + admin + blockable listings + cart
-- =========================================================

CREATE DATABASE IF NOT EXISTS gamemarket
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE gamemarket;

-- =========================================================
-- 1) USERS
-- =========================================================
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('user','admin') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =========================================================
-- 2) GAMES
-- =========================================================
CREATE TABLE IF NOT EXISTS games (
  id INT AUTO_INCREMENT PRIMARY KEY,
  owner_id INT NOT NULL,
  title VARCHAR(100) NOT NULL,
  platform ENUM('PS5','Xbox','Switch','PC','Other') DEFAULT 'Other',
  description TEXT,
  price_sell DECIMAL(10,2),
  price_rent_per_month DECIMAL(10,2),
  status ENUM('available','reserved','sold','rented','blocked') DEFAULT 'available',
  image_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- (indexer – körs normalt bara första gången)
ALTER TABLE games ADD INDEX idx_games_owner (owner_id);
ALTER TABLE games ADD INDEX idx_games_status (status);

-- =========================================================
-- 3) ORDERS
-- =========================================================
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  game_id INT NOT NULL,
  buyer_id INT NOT NULL,
  type ENUM('buy','rent') NOT NULL,
  rental_months INT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
  FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

ALTER TABLE orders ADD INDEX idx_orders_buyer (buyer_id);
ALTER TABLE orders ADD INDEX idx_orders_game (game_id);
ALTER TABLE orders ADD INDEX idx_orders_created (created_at);

-- =========================================================
-- 4) CART
--  - En rad per användare + spel (dvs. en variant i taget).
-- =========================================================
CREATE TABLE IF NOT EXISTS cart_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  game_id INT NOT NULL,
  type ENUM('buy','rent') NOT NULL,
  rental_months INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
  UNIQUE KEY uniq_user_game (user_id, game_id)
) ENGINE=InnoDB;

ALTER TABLE cart_items ADD INDEX idx_cart_user (user_id);
ALTER TABLE cart_items ADD INDEX idx_cart_created (created_at);

-- =========================================================
-- 5) (Valfritt) MySQL-användare för appen
-- =========================================================
CREATE USER IF NOT EXISTS 'gamemarket_user'@'localhost'
IDENTIFIED BY 'Yetorini!1';
GRANT ALL PRIVILEGES ON gamemarket.* TO 'gamemarket_user'@'localhost';
FLUSH PRIVILEGES;

-- =========================================================
-- 6) SEED DATA
--    (Körs lämpligen en gång. INSERT IGNORE så att
--     befintliga rader lämnas i fred.)
-- =========================================================

-- 6a) Users (med fasta id så att owner_id nedan stämmer)
INSERT IGNORE INTO users (id, username, email, password_hash, role) VALUES
(1, 'alex88',  'a@gmail.com',     '$2b$10$RFg.kPXi6WRjKxenmDdHy.yPyrfMMq.ijIlBg2h32le2BYB5h5BrW', 'user'),
(2, 'derya86', 'd@gmail.com',     '$2b$10$YzxupUTnygxIdjm17qJaaev5hh53tkkLbb80swz2hVd3ngS89.gVq', 'user'),
(3, 'bossman', 'admin@gmail.com', '$2b$10$c2gPNaZoGngejWZXH4zOYOxO1y9yAo.DTyHfy8DsN/1iTy0Tox0HK', 'admin');

-- 6b) 10 st PS5-spel (ägare 1/2). Status blir 'available' per default.
INSERT INTO games
(owner_id, title, platform, description, price_sell, price_rent_per_month, image_url)
VALUES
-- 1
(1, 'Call of Duty: Black Ops 7 (PS5)', 'PS5',
 'Året är 2035 och världen står på randen till kaos. Led ett JSOC-team genom hemliga operationer, intensiv multiplayer och ett nytt zombiesläge. Snabb action, taktiska beslut och filmisk kampanj.',
 749.00, 100.00, 'https://cdn.webhallen.com/images/product/388929?trim&w=1400'),

-- 2
(2, 'Ghost of Yōtei (PS5)', 'PS5',
 'Upptäck en stark, ny berättelse om en krigare i Japan som är ute på ett helt eget hämnduppdrag. Ghost of Yōtei tar vid 300 år efter det kritikerrosade Ghost of Tsushima och är ett fristående äventyr som utspelar sig på den japanska landsbygden på 1600-talet. Berättelsen följer en plågad, ensam legosoldat vid namn Atsu som reser genom Ezo på jakt efter dem som dödade hennes familj. Längs vägen finner hon oväntade allierade och band starkare än hon kunnat föreställa sig.',
 749.00, 100.00, 'https://cdn.webhallen.com/images/product/385437?trim&w=1400'),

-- 3
(1, 'Horizon Forbidden West: Complete Edition (PS5)', 'PS5',
 'Följ Aloy västerut till farliga, majestätiska landskap. Möt nya maskiner, utforska undervattensvärldar och upplev expansionen Burning Shores i denna kompletta utgåva.',
 699.00, 110.00, 'https://cdn.webhallen.com/images/product/310507?trim'),

-- 4
(2, 'Marvel’s Spider-Man 2 (PS5)', 'PS5',
 'Svinga dig genom New York som både Peter Parker och Miles Morales. Växla mellan hjältarna, lås upp nya förmågor och möt ikoniska skurkar i en filmisk superhjälteberättelse.',
 749.00, 130.00, 'https://cdn.webhallen.com/images/product/362485?trim'),

-- 5
(1, 'God of War Ragnarök (PS5)', 'PS5',
 'Kratos och Atreus ger sig ut på en resa över de nio rikena. Episka strider, stark relation mellan far och son och en värld på väg mot Ragnarök.',
 699.00, 120.00, 'https://cdn/webhallen.com/images/product/310508?trim'),

-- 6
(2, 'Elden Ring: Shadow of the Erdtree Edition (PS5)', 'PS5',
 'Utforska The Lands Between i ett öppet äventyr av FromSoftware. Denna utgåva inkluderar den massiva expansionen Shadow of the Erdtree för ännu fler bossar och hemligheter.',
 749.00, 140.00, 'https://cdn.webhallen.com/images/product/369619?trim'),

-- 7
(1, 'Final Fantasy VII Rebirth (PS5)', 'PS5',
 'Fortsätt Clouds resa i en vidsträckt värld med realtidsstrider och taktiska kommandon. Återförenas med vännerna och möt nya hot i denna storslagna del 2.',
 749.00, 130.00, 'https://cdn.webhallen.com/images/product/364994?trim'),

-- 8
(2, 'Gran Turismo 7 (PS5)', 'PS5',
 'Hundratals bilar, klassiska banor och djupa simfunktioner. Bygg din garagekollektion, finjustera och tävla online med ray tracing och DualSense-stöd.',
 599.00, 100.00, 'https://cdn.webhallen.com/images/product/320483?trim'),

-- 9
(1, 'Assassin’s Creed Mirage (PS5)', 'PS5',
 'Återvänd till seriens rötter med fokus på smygande och parkour. Upplev 800-talets Bagdad som lönnmördaren Basim i ett kompakt och berättardrivet äventyr.',
 549.00, 90.00, 'https://cdn.webhallen.com/images/product/361711?trim'),

-- 10
(2, 'EA Sports FC 25 (PS5)', 'PS5',
 'Bygg din klubb i karriär- och Ultimate Team-lägen. Förbättrat spelmoment, nya animationer och onlinefunktioner för intensiva matcher med vänner.',
 749.00, 120.00, 'https://cdn.webhallen.com/images/product/373100?trim');
