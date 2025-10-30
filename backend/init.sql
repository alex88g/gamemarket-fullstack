-- init.sql (PostgreSQL)

-- Skapa DB om du kör "psql -U postgres" mot default DB:
-- CREATE DATABASE appdb;
-- \c appdb

-- 1) USERS
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMP DEFAULT NOW(),
  CHECK (role IN ('user','admin'))
);

-- 2) GAMES
CREATE TABLE IF NOT EXISTS games (
  id SERIAL PRIMARY KEY,
  owner_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  platform TEXT DEFAULT 'Other',
  description TEXT,
  price_sell NUMERIC(10,2),
  price_rent_per_month NUMERIC(10,2),
  status TEXT DEFAULT 'available',
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  CHECK (status IN ('available','reserved','sold','rented','blocked'))
);

CREATE INDEX IF NOT EXISTS idx_games_owner ON games(owner_id);
CREATE INDEX IF NOT EXISTS idx_games_status ON games(status);

-- 3) ORDERS
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  game_id INT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  buyer_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  rental_months INT NULL,
  total_price NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  CHECK (type IN ('buy','rent'))
);

CREATE INDEX IF NOT EXISTS idx_orders_buyer ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_game ON orders(game_id);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at);

-- 4) CART
CREATE TABLE IF NOT EXISTS cart_items (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  game_id INT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  rental_months INT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (user_id, game_id),
  CHECK (type IN ('buy','rent'))
);

CREATE INDEX IF NOT EXISTS idx_cart_user ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_created ON cart_items(created_at);

-- 5) SEED (med fasta id:n för att ägar-id ska stämma)
INSERT INTO users (id, username, email, password_hash, role)
VALUES
(1, 'alex88',  'a@gmail.com',     '$2b$10$RFg.kPXi6WRjKxenmDdHy.yPyrfMMq.ijIlBg2h32le2BYB5h5BrW', 'user'),
(2, 'derya86', 'd@gmail.com',     '$2b$10$YzxupUTnygxIdjm17qJaaev5hh53tkkLbb80swz2hVd3ngS89.gVq', 'user'),
(3, 'bossman', 'admin@gmail.com', '$2b$10$c2gPNaZoGngejWZXH4zOYOxO1y9yAo.DTyHfy8DsN/1iTy0Tox0HK', 'admin')
ON CONFLICT (id) DO NOTHING;

-- bumpa sekvensen efter manuella id:n
SELECT setval(pg_get_serial_sequence('users','id'), (SELECT MAX(id) FROM users));

INSERT INTO games
(owner_id, title, platform, description, price_sell, price_rent_per_month, image_url)
VALUES
(1, 'Call of Duty: Black Ops 7 (PS5)', 'PS5',
 'Året är 2035...', 749.00, 100.00, 'https://cdn.webhallen.com/images/product/388929?trim&w=1400'),
(2, 'Ghost of Yōtei (PS5)', 'PS5',
 'Upptäck en stark, ny berättelse...', 749.00, 100.00, 'https://cdn.webhallen.com/images/product/385437?trim&w=1400'),
(1, 'Horizon Forbidden West: Complete Edition (PS5)', 'PS5',
 'Följ Aloy västerut...', 699.00, 110.00, 'https://cdn.webhallen.com/images/product/310507?trim'),
(2, 'Marvel’s Spider-Man 2 (PS5)', 'PS5',
 'Svinga dig genom New York...', 749.00, 130.00, 'https://cdn.webhallen.com/images/product/362485?trim'),
(1, 'God of War Ragnarök (PS5)', 'PS5',
 'Kratos och Atreus...', 699.00, 120.00, 'https://cdn/webhallen.com/images/product/310508?trim'),
(2, 'Elden Ring: Shadow of the Erdtree Edition (PS5)', 'PS5',
 'Utforska The Lands Between...', 749.00, 140.00, 'https://cdn.webhallen.com/images/product/369619?trim'),
(1, 'Final Fantasy VII Rebirth (PS5)', 'PS5',
 'Fortsätt Clouds resa...', 749.00, 130.00, 'https://cdn.webhallen.com/images/product/364994?trim'),
(2, 'Gran Turismo 7 (PS5)', 'PS5',
 'Hundratals bilar...', 599.00, 100.00, 'https://cdn.webhallen.com/images/product/320483?trim'),
(1, 'Assassin’s Creed Mirage (PS5)', 'PS5',
 'Återvänd till seriens rötter...', 549.00, 90.00, 'https://cdn.webhallen.com/images/product/361711?trim'),
(2, 'EA Sports FC 25 (PS5)', 'PS5',
 'Bygg din klubb...', 749.00, 120.00, 'https://cdn.webhallen.com/images/product/373100?trim')
ON CONFLICT DO NOTHING;
