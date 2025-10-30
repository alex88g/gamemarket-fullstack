// backend/controllers/orderController.js
import { pool } from '../db.js'

function normalizeMonths(m) {
  const n = parseInt(m, 10)
  if (isNaN(n) || n < 1) return 1
  return n
}

// POST /api/orders
export async function createOrder(req, res) {
  const buyerId = req.user.id
  const { gameId, type, rental_months } = req.body

  let client
  try {
    const { rows: games } = await pool.query(
      'SELECT * FROM games WHERE id = $1',
      [gameId]
    )

    if (games.length === 0) {
      return res.status(404).json({ message: 'Game not found' })
    }

    const game = games[0]

    if (game.owner_id === buyerId) {
      return res.status(400).json({ message: 'You cannot order your own listing' })
    }
    if (game.status !== 'available') {
      return res.status(400).json({ message: 'Game not available' })
    }

    let totalPrice = 0
    let monthsVal = null
    let newStatus = game.status

    if (type === 'buy') {
      if (game.price_sell == null) {
        return res.status(400).json({ message: 'This game is not for sale' })
      }
      totalPrice = Number(game.price_sell)
      newStatus = 'sold'
    } else if (type === 'rent') {
      if (game.price_rent_per_month == null) {
        return res.status(400).json({ message: 'This game is not for rent' })
      }
      monthsVal = normalizeMonths(rental_months)
      totalPrice = Number(game.price_rent_per_month) * monthsVal
      newStatus = 'rented'
    } else {
      return res.status(400).json({ message: 'Invalid order type' })
    }

    client = await pool.connect()
    await client.query('BEGIN')

    const { rows: orderRows } = await client.query(
      `INSERT INTO orders
        (game_id, buyer_id, type, rental_months, total_price)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING id`,
      [game.id, buyerId, type, monthsVal, totalPrice]
    )

    await client.query(
      'UPDATE games SET status = $1 WHERE id = $2',
      [newStatus, game.id]
    )

    await client.query('COMMIT')

    return res.status(201).json({
      id: orderRows[0].id,
      game_id: game.id,
      buyer_id: buyerId,
      type,
      rental_months: monthsVal,
      total_price: totalPrice,
      new_game_status: newStatus,
    })
  } catch (err) {
    if (client) await client.query('ROLLBACK')
    console.error('createOrder error:', err)
    return res.status(500).json({ message: 'Server error' })
  } finally {
    if (client) client.release()
  }
}

// GET /api/orders/me
export async function getMyOrders(req, res) {
  try {
    const buyerId = req.user.id
    const { rows } = await pool.query(
      `SELECT
         o.id,
         o.type,
         o.total_price,
         o.rental_months,
         o.created_at,
         g.title     AS "gameTitle",
         g.platform  AS platform
       FROM orders o
       JOIN games g ON g.id = o.game_id
       WHERE o.buyer_id = $1
       ORDER BY o.created_at DESC`,
      [buyerId]
    )
    return res.json(rows)
  } catch (err) {
    console.error('getMyOrders error:', err)
    return res.status(500).json({ message: 'Server error' })
  }
}

// GET /api/orders/all (admin)
export async function getAllOrders(req, res) {
  try {
    const { rows } = await pool.query(
      `SELECT
         o.id,
         o.type,
         o.total_price,
         o.rental_months,
         o.created_at,
         o.buyer_id,
         o.game_id,
         g.title     AS "gameTitle",
         u.username  AS "buyerName"
       FROM orders o
       JOIN games g ON g.id = o.game_id
       JOIN users u ON u.id = o.buyer_id
       ORDER BY o.created_at DESC`
    )
    return res.json(rows)
  } catch (err) {
    console.error('getAllOrders error:', err)
    return res.status(500).json({ message: 'Server error' })
  }
}
