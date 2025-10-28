# Express-backend: inställningar för `mysql2`, `bcryptjs`, `jsonwebtoken`, `cors`, `dotenv`

En komplett, minimalistisk backend-konfiguration som du kan klistra in rakt av. Inkluderar:

* Express-server med CORS
* MySQL-anslutning via `mysql2/promise`
* Registrering & inloggning med `bcryptjs` och `jsonwebtoken`
* JWT-middleware för skyddade endpoints
* `.env`-stöd via `dotenv`

> **Krav**: Node 18+, MySQL 8+

---

## 1) Installation & start

```bash
# Skapa projektmapp
mkdir gamemarket-fullstack

# Initiera npm
npm init -y

# Installera beroenden
npm i express mysql2 bcryptjs jsonwebtoken cors dotenv

# Utvecklingsverktyg (valfritt men rekommenderas)
npm i -D nodemon
```

Lägg till scripts i `package.json` (se filen nedan). Starta dev-servern:

```bash
npm run dev
# eller
npm start
```

---

## 2) Projektstruktur

```text
gamemarket-fullstack/
  .env                 # skapa själv (se .env.example)
  app.js
  db.js
  package.json
  routes/
    authRoutes.js
  controllers/
    authController.js
  middleware/
    auth.js
```

> Du kan lägga till fler mappar (t.ex. `routes/gameRoutes.js`, `controllers/gameController.js`) efter behov.

---

## 3) `package.json`

```json
{
  "name": "gamemarket-backend",
  "version": "1.0.0",
  "type": "module",
  "main": "app.js",
  "license": "MIT",
  "scripts": {
    "start": "node app.js",
    "dev": "nodemon app.js"
  },
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "jsonwebtoken": "^9.0.2",
    "mysql2": "^3.10.0"
  },
  "devDependencies": {
    "nodemon": "^3.1.0"
  }
}
```

---

## 4) `.env.example`

Skapa en fil `.env` i projektroten baserat på detta exempel:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASS=din_losenord
DB_NAME=gamemarket
# Generera en stark hemlighet, t.ex. med: node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
JWT_SECRET=byt_till_en_stark_hemlighet

# Tillåtna origins för CORS, kommaseparerade (utan mellanslag)
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

---

## 5) `db.js` – MySQL-anslutning (mysql2/promise)

```js
// db.js
import mysql from 'mysql2/promise'
import dotenv from 'dotenv'
dotenv.config()

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  connectionLimit: 10,
  namedPlaceholders: true,
})

// Hjälpfunktion (valfri) för att testa DB vid start
export async function assertDbConnection() {
  const conn = await pool.getConnection()
  try {
    await conn.ping()
    console.log('✅ MySQL connected')
  } finally {
    conn.release()
  }
}
```

---

## 6) `app.js` – Express, CORS, routes

```js
// app.js
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { assertDbConnection } from './db.js'

// Routes
import authRoutes from './routes/authRoutes.js'

dotenv.config()

const app = express()

// Body parser
app.use(express.json())

// CORS
const allowed = (process.env.CORS_ORIGINS || '').split(',').filter(Boolean)
app.use(cors({
  origin: (origin, cb) => {
    // Tillåt tooler som saknar origin (t.ex. curl/Postman) och origins i whitelist
    if (!origin || allowed.includes(origin)) return cb(null, true)
    return cb(new Error(`CORS blocked for origin: ${origin}`))
  },
  credentials: true,
}))

// Routes
app.use('/api/auth', authRoutes)

app.get('/api/health', (req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() })
})

const PORT = process.env.PORT || 5000

// Starta
app.listen(PORT, async () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`)
  try {
    await assertDbConnection()
  } catch (e) {
    console.error('❌ DB connection failed:', e.message)
  }
})
```

---

## 7) `middleware/auth.js` – JWT-middleware

```js
// middleware/auth.js
import jwt from 'jsonwebtoken'

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader) return res.status(401).json({ message: 'No token' })

  const token = authHeader.split(' ')[1]
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded // { id, username, role }
    next()
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' })
  }
}

export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admins only' })
  }
  next()
}
```

---

## 8) `controllers/authController.js` – register & login

```js
// controllers/authController.js
import { pool } from '../db.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export async function register(req, res) {
  try {
    const { username, email, password } = req.body
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'username, email, password required' })
    }

    // Finns redan?
    const [exists] = await pool.query(
      'SELECT id FROM users WHERE email = ? OR username = ?',
      [email, username]
    )
    if (exists.length > 0) {
      return res.status(400).json({ message: 'User already exists' })
    }

    const password_hash = await bcrypt.hash(password, 10)

    const [result] = await pool.query(
      'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [username, email, password_hash, 'user']
    )

    return res.status(201).json({
      id: result.insertId,
      username,
      email,
      role: 'user',
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Server error' })
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ message: 'email, password required' })
    }

    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email])
    if (rows.length === 0) return res.status(400).json({ message: 'Invalid credentials' })

    const user = rows[0]
    const ok = await bcrypt.compare(password, user.password_hash)
    if (!ok) return res.status(400).json({ message: 'Invalid credentials' })

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    return res.json({
      token,
      user: { id: user.id, username: user.username, email: user.email, role: user.role },
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Server error' })
  }
}
```

---

## 9) `routes/authRoutes.js`

```js
// routes/authRoutes.js
import { Router } from 'express'
import { register, login } from '../controllers/authController.js'

const router = Router()

router.post('/register', register)
router.post('/login', login)

export default router
```

---

## 10) Minsta nödvändiga SQL (Users-tabell)

Skapa databasen och `users`-tabellen i MySQL:

```sql
CREATE DATABASE IF NOT EXISTS gamemarket;
USE gamemarket;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('user','admin') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;
```

> Tips: Lägg till admin-konto manuellt om du vill
>
> ```sql
> INSERT INTO users (username,email,password_hash,role)
> VALUES ('admin','admin@example.com', '$2a$10$z8o2Gv....(bcrypt-hash)....', 'admin');
> ```

Skapa en hash för ett känt lösenord:

```bash
node -e "(async ()=>{const b=require('bcryptjs');console.log(await b.hash('AdminLosen123',10));})()"
```

---

## 11) Snabbtest (HTTP)

**Registrera:**

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"kalle","email":"kalle@example.com","password":"hemlis"}'
```

**Logga in:**

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"kalle@example.com","password":"hemlis"}'
```

Spara `token` från svaret och använd i `Authorization`-headern för skyddade endpoints:

```bash
curl http://localhost:5000/api/health \
  -H "Authorization: Bearer <DIN_JWT_TOKEN>"
```

---

## 12) Vanliga problem & lösningar

* **CORS-fel i webbläsare:**

  * Kontrollera att `CORS_ORIGINS` i `.env` innehåller din frontend-URL (t.ex. `http://localhost:5173`).
* **`Invalid token`:**

  * Se till att du skickar `Authorization: Bearer <token>` och att `JWT_SECRET` i `.env` inte ändrats efter inloggning.
* **MySQL-anslutning misslyckas:**

  * Verifiera att `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME` stämmer och att databasen/tabellen finns.
* **EADDRINUSE (port upptagen):**

  * Stäng gamla processer eller ändra `PORT` i `.env`.

---

### Klart!

Nu har vi en ren, produktionslik setup för Express + MySQL + bcrypt + JWT + CORS + dotenv. Lägg till fler routes/controllers enligt samma mönster för spel, ordrar, etc.
