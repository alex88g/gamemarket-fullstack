// backend/controllers/orderController.js
import { pool } from '../db.js'

// Hjälp: se till att månader alltid är minst 1
function normalizeMonths(m) {
  const n = parseInt(m, 10)
  if (isNaN(n) || n < 1) return 1
  return n
}

// POST /api/orders
// body: { gameId, type: 'buy' | 'rent', rental_months? }
export async function createOrder(req, res) {
  const buyerId = req.user.id
  const { gameId, type, rental_months } = req.body

  let conn
  try {
    // 1. plocka spelet
    const [games] = await pool.query(
      'SELECT * FROM games WHERE id = ?',
      [gameId]
    )

    if (games.length === 0) {
      return res.status(404).json({ message: 'Game not found' })
    }

    const game = games[0]

    // får du köpa/hyra ditt eget spel? nej
    if (game.owner_id === buyerId) {
      return res.status(400).json({ message: 'You cannot order your own listing' })
    }

    // spelet måste vara available
    if (game.status !== 'available') {
      return res.status(400).json({ message: 'Game not available' })
    }

    // 2. räkna ut totalpris + ny status
    let totalPrice = 0
    let monthsVal = null
    let newStatus = game.status // start 'available'

    if (type === 'buy') {
      // Köp
      if (game.price_sell == null) {
        return res.status(400).json({ message: 'This game is not for sale' })
      }
      totalPrice = Number(game.price_sell)
      newStatus = 'sold'
    } else if (type === 'rent') {
      // Hyra per månad
      if (game.price_rent_per_month == null) {
        return res.status(400).json({ message: 'This game is not for rent' })
      }
      monthsVal = normalizeMonths(rental_months)
      totalPrice = Number(game.price_rent_per_month) * monthsVal
      newStatus = 'rented'
    } else {
      return res.status(400).json({ message: 'Invalid order type' })
    }

    // 3. gör transaction: skapa order + uppdatera spelstatus
    conn = await pool.getConnection()
    try {
      await conn.beginTransaction()

      const [orderResult] = await conn.query(
        `INSERT INTO orders
          (game_id, buyer_id, type, rental_months, total_price)
         VALUES (?,?,?,?,?)`,
        [
          game.id,
          buyerId,
          type,
          monthsVal,      // null vid köp
          totalPrice
        ]
      )

      await conn.query(
        'UPDATE games SET status = ? WHERE id = ?',
        [newStatus, game.id]
      )

      await conn.commit()

      return res.status(201).json({
        id: orderResult.insertId,
        game_id: game.id,
        buyer_id: buyerId,
        type,
        rental_months: monthsVal,
        total_price: totalPrice,
        new_game_status: newStatus,
      })
    } catch (txErr) {
      // rulla tillbaka om något failar mitt i
      if (conn) {
        await conn.rollback()
      }
      console.error('createOrder TX error:', txErr)
      return res.status(500).json({ message: 'Order transaction failed' })
    }
  } catch (err) {
    console.error('createOrder error:', err)
    return res.status(500).json({ message: 'Server error' })
  } finally {
    if (conn) conn.release()
  }
}

// GET /api/orders/me
// visar alla ordrar för inloggade användaren
export async function getMyOrders(req, res) {
  try {
    const buyerId = req.user.id
    const [rows] = await pool.query(
      `SELECT
         o.id,
         o.type,
         o.total_price,
         o.rental_months,
         o.created_at,
         g.title     AS gameTitle,
         g.platform  AS platform
       FROM orders o
       JOIN games g ON g.id = o.game_id
       WHERE o.buyer_id = ?
       ORDER BY o.created_at DESC`,
      [buyerId]
    )

    return res.json(rows)
  } catch (err) {
    console.error('getMyOrders error:', err)
    return res.status(500).json({ message: 'Server error' })
  }
}

// GET /api/orders/all  (endast admin)
export async function getAllOrders(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT
         o.id,
         o.type,
         o.total_price,
         o.rental_months,
         o.created_at,
         o.buyer_id,
         o.game_id,
         g.title     AS gameTitle,
         u.username  AS buyerName
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
