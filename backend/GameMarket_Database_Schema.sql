-- =========================================================
-- GameMarket Database Schema
-- Version: monthly rental + admin + blockable listings
-- =========================================================

-- 1. Skapa databasen (kör som root)
CREATE DATABASE IF NOT EXISTS gamemarket
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE gamemarket;

-- =========================================================
-- 2. USERS
-- - lagrar användarkonton
-- - role styr behörighet ('user' eller 'admin')
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
-- 3. GAMES (annonser)
-- - varje rad är ett spel som en användare lagt upp
-- - price_sell kan vara NULL om spelet bara hyrs ut
-- - price_rent_per_month kan vara NULL om spelet bara säljs
-- - status inkluderar 'blocked' → admin kan blockera annons
-- =========================================================
CREATE TABLE IF NOT EXISTS games (
  id INT AUTO_INCREMENT PRIMARY KEY,
  owner_id INT NOT NULL,
  title VARCHAR(100) NOT NULL,
  platform ENUM('PS5','Xbox','Switch','PC','Other') DEFAULT 'Other',
  description TEXT,
  price_sell DECIMAL(10,2),                -- NULL = inte till salu
  price_rent_per_month DECIMAL(10,2),      -- NULL = ej uthyres
  status ENUM('available','reserved','sold','rented','blocked')
         DEFAULT 'available',
  image_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id)
    REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

-- =========================================================
-- 4. ORDERS (köp/hyra)
-- - type = 'buy' eller 'rent'
-- - rental_months gäller bara när type='rent'
-- - total_price är slutpriset för transaktionen
-- =========================================================
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  game_id INT NOT NULL,
  buyer_id INT NOT NULL,
  type ENUM('buy','rent') NOT NULL,
  rental_months INT NULL,                 -- t.ex. 1,2,3 månader (NULL om köp)
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (game_id)
    REFERENCES games(id)
    ON DELETE CASCADE,
  FOREIGN KEY (buyer_id)
    REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

-- =========================================================
-- 5. (Valfritt) skapa app-användare i MySQL
--    så backend inte behöver logga in som root.
--    Kör detta som root första gången:
-- =========================================================
CREATE USER IF NOT EXISTS 'gamemarket_user'@'localhost'
IDENTIFIED BY 'Yetorini!1';

GRANT ALL PRIVILEGES
ON gamemarket.* TO 'gamemarket_user'@'localhost';

FLUSH PRIVILEGES;

-- =========================================================
-- 6. (Valfritt) skapa en admin-användare i appens users-tabell
--    Detta görs normalt via /auth/register och sedan UPDATE.
--    Exempel:
--    INSERT INTO users (username,email,password_hash,role)
--    VALUES ('bossman','admin@gmail.com','<bcrypt-hash>','admin');
--
--    eller:
--    UPDATE users SET role='admin' WHERE id = 3;
-- =========================================================
