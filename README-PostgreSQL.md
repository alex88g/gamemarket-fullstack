# Gamemarket Backend — Express + PostgreSQL

En komplett, ren backend för ditt projekt med **Express**, **PostgreSQL (`pg`)**, **bcryptjs**, **JWT**, **CORS** och **dotenv**.

- ✅ Express-server med CORS  
- ✅ PostgreSQL via `pg` (Pool)  
- ✅ Registrering & inloggning (bcrypt + JWT)  
- ✅ JWT-middleware för skyddade endpoints  
- ✅ `.env`-stöd  
- ✅ Färdigt `init.sql` för schema + seed

> **Krav:** Node 18+ · PostgreSQL 14+ (du kör 18) · Windows/macOS/Linux

---

## Innehåll

1. [Snabbstart (TL;DR)](#snabbstart-tldr)  
2. [Projektstruktur](#projektstruktur)  
3. [Installera beroenden](#installera-beroenden)  
4. [Konfiguration (.env)](#konfiguration-env)  
5. [Kodfiler (kärna)](#kodfiler-kärna)  
6. [Initiera PostgreSQL-databasen](#initiera-postgresql-databasen)  
   - [Windows (PowerShell)](#windows-powershell)  
   - [macOS/Linux (Terminal)](#macoslinux-terminal)  
   - [Verifiera installationen](#verifiera-installationen)  
7. [Starta servern](#starta-servern)  
8. [Snabbtest (HTTP)](#snabbtest-http)  
9. [Felsökning](#felsökning)  
10. [PSQL-knep (bilaga)](#psql-knep-bilaga)

---

## Snabbstart (TL;DR)

```bash
# 1) Gå till backend-mappen
cd backend

# 2) Installera paket
npm i

# 3) Skapa .env (se exempel nedan)
#   PORT=5000
#   PGURI=postgres://app_user:AppUser!2025@127.0.0.1:5432/appdb
#   JWT_SECRET=superhemlig_nyckel
#   CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

# 4) Skapa Postgres-roll + databas och kör init.sql (se guiden nedan)

# 5) Starta servern
npm run dev   # eller npm start
```

---

## Projektstruktur

```text
backend/
  README.md
  .env                 # skapa själv (se .env-exempel)
  app.js
  db.js
  init.sql             # schema + seed (spara som UTF-8)
  package.json
  routes/
    authRoutes.js
    gameRoutes.js
    orderRoutes.js
    adminRoutes.js
    cartRoutes.js
  controllers/
    authController.js
  middleware/
    auth.js
```

> Du har redan controllers och routes för games, orders, admin, cart. Lägg till/ändra efter behov.

---

## Installera beroenden

```bash
cd backend
npm i
# Dev
npm i -D nodemon
```

`package.json` innehåller scripts:

```json
{
  "name": "backend",
  "version": "1.0.0",
  "main": "app.js",
  "type": "module",
  "scripts": {
    "start": "node app.js",
    "dev": "nodemon app.js",
    "test": "echo \\"Error: no test specified\\" && exit 1"
  },
  "dependencies": {
    "bcryptjs": "^3.0.2",
    "cors": "^2.8.5",
    "dotenv": "^17.2.3",
    "express": "^5.1.0",
    "jsonwebtoken": "^9.0.2",
    "pg": "^8.16.3"
  },
  "devDependencies": {
    "nodemon": "^3.1.10"
  }
}
```

---

## Konfiguration (.env)

Skapa **`backend/.env`**:

```env
PORT=5000
PGURI=postgres://app_user:AppUser!2025@127.0.0.1:5432/appdb
JWT_SECRET=superhemlig_nyckel

# Tillåtna origins för CORS (kommaseparerade, utan mellanslag)
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

> Tips: Generera stark hemlighet  
> `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`

---

## Kodfiler (kärna)

### `db.js`

```js
import dotenv from 'dotenv';
dotenv.config();

import pkg from 'pg';
const { Pool } = pkg;

// PGURI ex: postgres://user:pass@host:5432/db
export const pool = new Pool({
  connectionString: process.env.PGURI,
});

export async function assertDbConnection() {
  const client = await pool.connect();
  try {
    await client.query('SELECT 1');
    console.log('✅ PostgreSQL connected');
  } finally {
    client.release();
  }
}
```

### `app.js`

```js
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { assertDbConnection } from './db.js'

import authRoutes from './routes/authRoutes.js'
import gameRoutes from './routes/gameRoutes.js'
import orderRoutes from './routes/orderRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import cartRoutes from './routes/cartRoutes.js'

dotenv.config()

const app = express()
app.use(express.json())

const allowed = (process.env.CORS_ORIGINS || 'http://localhost:5173')
  .split(',')
  .filter(Boolean)

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowed.includes(origin)) return cb(null, true)
    return cb(new Error(\`CORS blocked for origin: \${origin}\`))
  },
  credentials: true,
}))

app.use('/api/auth', authRoutes)
app.use('/api/games', gameRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/cart', cartRoutes)

app.get('/api/health', (req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, async () => {
  console.log(\`🚀 Server listening on http://localhost:\${PORT}\`)
  try {
    await assertDbConnection()
  } catch (e) {
    console.error('❌ DB connection failed:', e.message)
  }
})
```

### `middleware/auth.js`

```js
import jwt from 'jsonwebtoken'

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader) return res.status(401).json({ message: 'No token' })

  const token = authHeader.split(' ')[1]
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded // { id, username, role }
    next()
  } catch {
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

## Initiera PostgreSQL-databasen

> **Viktigt:** Spara `init.sql` som **UTF-8 (utan BOM)** för att undvika teckenfel på Windows.

`init.sql` innehåller:
- Tabeller: `users`, `games`, `orders`, `cart_items`  
- Index, constraints  
- Seed: 3 users + 10 games (körbar flera gånger via `ON CONFLICT`)

### Windows (PowerShell)

1) **Öppna PowerShell** och gå till din backend-mapp:
```powershell
cd C:\Users\alexander\gamemarket-fullstack\backend
```

2) **(Rekommenderat) Sätt UTF-8 i konsolen** för att slippa åäö-problem:
```powershell
chcp 65001 | Out-Null
$env:PGCLIENTENCODING = 'UTF8'
```

3) **Skapa roll och databas** (kör som `postgres`):
```powershell
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -h 127.0.0.1 -U postgres -d postgres -W
```
Klistra in i psql:
```sql
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'app_user') THEN
    CREATE ROLE app_user LOGIN PASSWORD 'AppUser!2025';
  END IF;
END $$;

CREATE DATABASE appdb OWNER app_user;
\q
```

4) **Kör `init.sql` mot `appdb` som `app_user`:**
```powershell
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" `
  -h 127.0.0.1 -U app_user -d appdb -W `
  -v ON_ERROR_STOP=1 `
  -f .\init.sql
```

> Om du får `permission denied for schema public`:  
> - Antingen kör `init.sql` som `postgres`, **eller** sätt ägarskap:
```powershell
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -h 127.0.0.1 -U postgres -d appdb -W -c "ALTER SCHEMA public OWNER TO app_user;"
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -h 127.0.0.1 -U postgres -d appdb -W -c "ALTER TABLE public.users, public.games, public.orders, public.cart_items OWNER TO app_user;"
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -h 127.0.0.1 -U postgres -d appdb -W -c "ALTER SEQUENCE users_id_seq, games_id_seq, orders_id_seq, cart_items_id_seq OWNER TO app_user;"
```

### macOS/Linux (Terminal)

```bash
cd backend
export PGCLIENTENCODING=UTF8

# Skapa roll + db (logga in som postgres-användare)
psql -h 127.0.0.1 -U postgres -d postgres <<'SQL'
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'app_user') THEN
    CREATE ROLE app_user LOGIN PASSWORD 'AppUser!2025';
  END IF;
END $$;
CREATE DATABASE appdb OWNER app_user;
SQL

# Kör init
psql -h 127.0.0.1 -U app_user -d appdb -v ON_ERROR_STOP=1 -f ./init.sql
```

### Verifiera installationen

Windows:
```powershell
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -h 127.0.0.1 -U app_user -d appdb -W -c "\dt"
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -h 127.0.0.1 -U app_user -d appdb -W -c "SELECT COUNT(*) FROM users;"
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -h 127.0.0.1 -U app_user -d appdb -W -c "SELECT COUNT(*) FROM games;"
```

Snabbt testa Node-koppling (läser `PGURI` från `.env`):
```bash
node -e "require('dotenv').config(); const {Pool}=require('pg'); const p=new Pool({connectionString:process.env.PGURI}); p.query('select now()').then(r=>{console.log(r.rows[0]); p.end();}).catch(e=>{console.error(e); process.exit(1);});"
```

---

## Starta servern

```bash
cd backend
npm run dev   # eller npm start
```

Förväntad output:
```
🚀 Server listening on http://localhost:5000
✅ PostgreSQL connected
```

---

## Snabbtest (HTTP)

**Health**
```bash
curl http://localhost:5000/api/health
```

**Registrera**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"kalle","email":"kalle@example.com","password":"hemlis"}'
```

**Logga in**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"kalle@example.com","password":"hemlis"}'
```

Använd `token` för skyddade endpoints:
```bash
curl http://localhost:5000/api/orders \
  -H "Authorization: Bearer <DIN_JWT_TOKEN>"
```

> **Notis om seedade användare:** `init.sql` skapar 3 användare med **okända** plaintextlösenord (bara bcrypt-hashar). Registrera egna konton för inloggning.

---

## Felsökning

- **`password authentication failed for user "postgres"`**  
  Kontrollera att du satt/kommer ihåg postgres-lösenordet. Logga in med `psql -U postgres -W` och kör ev.:  
  ```sql
  ALTER USER postgres WITH PASSWORD 'NyttStarktLosen!';
  ```
  Se även `pg_hba.conf` om autentiseringsmetod (ska vara `scram-sha-256` normalt).

- **`permission denied for schema public`**  
  Kör `init.sql` som `postgres` **eller** ge `app_user` ägarskap:
  ```sql
  ALTER SCHEMA public OWNER TO app_user;
  ALTER TABLE public.users, public.games, public.orders, public.cart_items OWNER TO app_user;
  ALTER SEQUENCE users_id_seq, games_id_seq, orders_id_seq, cart_items_id_seq OWNER TO app_user;
  ```

- **Teckenfel på Windows (WIN1252 vs UTF-8), ex. `character with byte sequence ... has no equivalent in UTF8`**  
  Spara `init.sql` som **UTF-8** och sätt:
  ```powershell
  chcp 65001 | Out-Null
  $env:PGCLIENTENCODING = 'UTF8'
  ```
  Kör sedan `psql ... -f .\init.sql` igen.

- **`role "app_user" does not exist`**  
  Skapa rollen innan du skapar databasen:
  ```sql
  DO $$
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'app_user') THEN
      CREATE ROLE app_user LOGIN PASSWORD 'AppUser!2025';
    END IF;
  END $$;
  ```

- **CORS-fel i webbläsare**  
  Se att din frontend-URL finns i `CORS_ORIGINS` (t.ex. `http://localhost:5173`).

- **`EADDRINUSE` (port upptagen)**  
  Stäng gamla processer eller ändra `PORT` i `.env`.

---

## PSQL-knep (bilaga)

I `psql`:

```sql
\l            -- lista databaser
\c appdb      -- anslut till appdb
\dt           -- lista tabeller
\d+ users     -- beskriv tabell
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM games;
SELECT current_user, current_database();
```

---


