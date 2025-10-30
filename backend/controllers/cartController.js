// backend/controllers/cartController.js
import { pool } from '../db.js'

// GET /api/cart  (mina korgartiklar med spelinfo)
export async function getMyCart(req, res) {
  try {
    const userId = req.user.id
    const [rows] = await pool.query(
      `SELECT
         c.id,
         c.game_id,
         c.type,
         c.rental_months,
         g.title,
         g.platform,
         g.image_url,
         g.price_sell,
         g.price_rent_per_month,
         g.status AS game_status,
         g.owner_id,
         u.username AS ownerName
       FROM cart_items c
       JOIN games g ON g.id = c.game_id
       JOIN users u ON u.id = g.owner_id
       WHERE c.user_id = ?
       ORDER BY c.created_at DESC`,
      [userId]
    )
    res.json(rows)
  } catch (e) {
    console.error('getMyCart error:', e)
    res.status(500).json({ message: 'Server error' })
  }
}

// POST /api/cart  body: { gameId, type: 'buy'|'rent', rental_months? }
export async function addToCart(req, res) {
  try {
    const userId = req.user.id
    const { gameId, type, rental_months } = req.body

    if (!gameId || !type) {
      return res.status(400).json({ message: 'gameId och type krävs' })
    }
    // hämta spelet
    const [gRows] = await pool.query('SELECT * FROM games WHERE id = ?', [gameId])
    if (gRows.length === 0) return res.status(404).json({ message: 'Game not found' })
    const game = gRows[0]

    if (game.owner_id === userId) {
      return res.status(400).json({ message: 'Du kan inte lägga din egen annons i korgen' })
    }
    if (game.status !== 'available') {
      return res.status(400).json({ message: 'Spelet är inte tillgängligt' })
    }

    let months = null
    if (type === 'rent') {
      const n = parseInt(rental_months, 10)
      months = isNaN(n) || n < 1 ? 1 : n
      if (game.price_rent_per_month == null) {
        return res.status(400).json({ message: 'Spelet är inte möjligt att hyra' })
      }
    } else if (type === 'buy') {
      if (game.price_sell == null) {
        return res.status(400).json({ message: 'Spelet är inte till salu' })
      }
    } else {
      return res.status(400).json({ message: 'Ogiltig type' })
    }

    // sätt eller uppdatera (tack vare UNIQUE(user_id, game_id))
    await pool.query(
      `INSERT INTO cart_items (user_id, game_id, type, rental_months)
       VALUES (?,?,?,?)
       ON DUPLICATE KEY UPDATE type=VALUES(type), rental_months=VALUES(rental_months)`,
      [userId, gameId, type, months]
    )

    res.status(201).json({ message: 'Tillagd i kundvagn' })
  } catch (e) {
    console.error('addToCart error:', e)
    res.status(500).json({ message: 'Server error' })
  }
}

// DELETE /api/cart/:id  (ta bort en rad från korgen)
export async function removeCartItem(req, res) {
  try {
    const userId = req.user.id
    const id = req.params.id
    await pool.query('DELETE FROM cart_items WHERE id = ? AND user_id = ?', [id, userId])
    res.json({ message: 'Borttagen' })
  } catch (e) {
    console.error('removeCartItem error:', e)
    res.status(500).json({ message: 'Server error' })
  }
}

// DELETE /api/cart  (töm korgen)
export async function clearCart(req, res) {
  try {
    const userId = req.user.id
    await pool.query('DELETE FROM cart_items WHERE user_id = ?', [userId])
    res.json({ message: 'Korgen tömd' })
  } catch (e) {
    console.error('clearCart error:', e)
    res.status(500).json({ message: 'Server error' })
  }
}

// POST /api/cart/checkout  (skapa ordrar från korgen)
export async function checkoutCart(req, res) {
  const userId = req.user.id
  let conn
  try {
    // hämta korgen
    const [items] = await pool.query(
      `SELECT c.*, g.price_sell, g.price_rent_per_month, g.status AS game_status
       FROM cart_items c
       JOIN games g ON g.id = c.game_id
       WHERE c.user_id = ?
       ORDER BY c.created_at ASC`,
      [userId]
    )
    if (items.length === 0) {
      return res.status(400).json({ message: 'Korgen är tom' })
    }

    conn = await pool.getConnection()
    await conn.beginTransaction()

    const created = []
    const errors = []

    // gå igenom varje rad och försök skapa order
    for (const it of items) {
      // dubbelkolla availability vid checkout
      const [gRows] = await conn.query('SELECT * FROM games WHERE id = ? FOR UPDATE', [it.game_id])
      if (!gRows.length) {
        errors.push({ cart_id: it.id, reason: 'Annons saknas' })
        continue
      }
      const g = gRows[0]
      if (g.status !== 'available') {
        errors.push({ cart_id: it.id, reason: 'Annons är inte tillgänglig längre' })
        continue
      }
      if (g.owner_id === userId) {
        errors.push({ cart_id: it.id, reason: 'Egen annons' })
        continue
      }

      if (it.type === 'buy') {
        if (g.price_sell == null) {
          errors.push({ cart_id: it.id, reason: 'Inte till salu' })
          continue
        }
        const total = Number(g.price_sell)
        const [orderResult] = await conn.query(
          `INSERT INTO orders (game_id, buyer_id, type, rental_months, total_price)
           VALUES (?,?,?,?,?)`,
          [g.id, userId, 'buy', null, total]
        )
        await conn.query('UPDATE games SET status = ? WHERE id = ?', ['sold', g.id])
        await conn.query('DELETE FROM cart_items WHERE id = ?', [it.id])
        created.push({ order_id: orderResult.insertId, game_id: g.id, type: 'buy', total_price: total })
      } else if (it.type === 'rent') {
        if (g.price_rent_per_month == null) {
          errors.push({ cart_id: it.id, reason: 'Inte möjlig att hyra' })
          continue
        }
        const months = Math.max(1, parseInt(it.rental_months || 1, 10))
        const total = Number(g.price_rent_per_month) * months
        const [orderResult] = await conn.query(
          `INSERT INTO orders (game_id, buyer_id, type, rental_months, total_price)
           VALUES (?,?,?,?,?)`,
          [g.id, userId, 'rent', months, total]
        )
        await conn.query('UPDATE games SET status = ? WHERE id = ?', ['rented', g.id])
        await conn.query('DELETE FROM cart_items WHERE id = ?', [it.id])
        created.push({ order_id: orderResult.insertId, game_id: g.id, type: 'rent', rental_months: months, total_price: total })
      } else {
        errors.push({ cart_id: it.id, reason: 'Okänd typ' })
      }
    }

    await conn.commit()

    return res.json({ created, errors })
  } catch (e) {
    if (conn) await conn.rollback()
    console.error('checkoutCart error:', e)
    res.status(500).json({ message: 'Server error' })
  } finally {
    if (conn) conn.release()
  }
}
