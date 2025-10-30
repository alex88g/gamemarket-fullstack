// backend/controllers/cartController.js
import { pool } from '../db.js'

// GET /api/cart
export async function getMyCart(req, res) {
  try {
    const userId = req.user.id
    const { rows } = await pool.query(
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
         u.username AS "ownerName"
       FROM cart_items c
       JOIN games g ON g.id = c.game_id
       JOIN users u ON u.id = g.owner_id
       WHERE c.user_id = $1
       ORDER BY c.created_at DESC`,
      [userId]
    )
    res.json(rows)
  } catch (e) {
    console.error('getMyCart error:', e)
    res.status(500).json({ message: 'Server error' })
  }
}

// POST /api/cart
export async function addToCart(req, res) {
  try {
    const userId = req.user.id
    const { gameId, type, rental_months } = req.body

    if (!gameId || !type) {
      return res.status(400).json({ message: 'gameId och type krävs' })
    }

    const { rows: gRows } = await pool.query('SELECT * FROM games WHERE id = $1', [gameId])
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

    // ON CONFLICT istället för MySQLs ON DUPLICATE KEY
    await pool.query(
      `INSERT INTO cart_items (user_id, game_id, type, rental_months)
       VALUES ($1,$2,$3,$4)
       ON CONFLICT (user_id, game_id)
       DO UPDATE SET type = EXCLUDED.type, rental_months = EXCLUDED.rental_months`,
      [userId, gameId, type, months]
    )

    res.status(201).json({ message: 'Tillagd i kundvagn' })
  } catch (e) {
    console.error('addToCart error:', e)
    res.status(500).json({ message: 'Server error' })
  }
}

// DELETE /api/cart/:id
export async function removeCartItem(req, res) {
  try {
    const userId = req.user.id
    const id = req.params.id
    await pool.query('DELETE FROM cart_items WHERE id = $1 AND user_id = $2', [id, userId])
    res.json({ message: 'Borttagen' })
  } catch (e) {
    console.error('removeCartItem error:', e)
    res.status(500).json({ message: 'Server error' })
  }
}

// DELETE /api/cart
export async function clearCart(req, res) {
  try {
    const userId = req.user.id
    await pool.query('DELETE FROM cart_items WHERE user_id = $1', [userId])
    res.json({ message: 'Korgen tömd' })
  } catch (e) {
    console.error('clearCart error:', e)
    res.status(500).json({ message: 'Server error' })
  }
}

// POST /api/cart/checkout
export async function checkoutCart(req, res) {
  const userId = req.user.id
  let client
  try {
    const { rows: items } = await pool.query(
      `SELECT c.*, g.price_sell, g.price_rent_per_month, g.status AS game_status
       FROM cart_items c
       JOIN games g ON g.id = c.game_id
       WHERE c.user_id = $1
       ORDER BY c.created_at ASC`,
      [userId]
    )
    if (items.length === 0) {
      return res.status(400).json({ message: 'Korgen är tom' })
    }

    client = await pool.connect()
    await client.query('BEGIN')

    const created = []
    const errors = []

    for (const it of items) {
      // lås raden för att undvika race
      const { rows: gRows } = await client.query(
        'SELECT * FROM games WHERE id = $1 FOR UPDATE',
        [it.game_id]
      )
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
        const { rows: orderRows } = await client.query(
          `INSERT INTO orders (game_id, buyer_id, type, rental_months, total_price)
           VALUES ($1,$2,$3,$4,$5) RETURNING id`,
          [g.id, userId, 'buy', null, total]
        )
        await client.query('UPDATE games SET status = $1 WHERE id = $2', ['sold', g.id])
        await client.query('DELETE FROM cart_items WHERE id = $1', [it.id])
        created.push({ order_id: orderRows[0].id, game_id: g.id, type: 'buy', total_price: total })
      } else if (it.type === 'rent') {
        if (g.price_rent_per_month == null) {
          errors.push({ cart_id: it.id, reason: 'Inte möjlig att hyra' })
          continue
        }
        const months = Math.max(1, parseInt(it.rental_months || 1, 10))
        const total = Number(g.price_rent_per_month) * months
        const { rows: orderRows } = await client.query(
          `INSERT INTO orders (game_id, buyer_id, type, rental_months, total_price)
           VALUES ($1,$2,$3,$4,$5) RETURNING id`,
          [g.id, userId, 'rent', months, total]
        )
        await client.query('UPDATE games SET status = $1 WHERE id = $2', ['rented', g.id])
        await client.query('DELETE FROM cart_items WHERE id = $1', [it.id])
        created.push({ order_id: orderRows[0].id, game_id: g.id, type: 'rent', rental_months: months, total_price: total })
      } else {
        errors.push({ cart_id: it.id, reason: 'Okänd typ' })
      }
    }

    await client.query('COMMIT')
    return res.json({ created, errors })
  } catch (e) {
    if (client) await client.query('ROLLBACK')
    console.error('checkoutCart error:', e)
    res.status(500).json({ message: 'Server error' })
  } finally {
    if (client) client.release()
  }
}
