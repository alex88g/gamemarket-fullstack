// controllers/gameController.js
import { pool } from '../db.js';

// Hämta alla spel (offentlig lista)
export async function getAllGames(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT g.*, u.username AS ownerName
       FROM games g
       JOIN users u ON u.id = g.owner_id
       ORDER BY g.created_at DESC`
    );
    return res.json(rows);
  } catch (err) {
    console.error('getAllGames error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// Hämta specifikt spel
export async function getGameById(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT g.*, u.username AS ownerName
       FROM games g
       JOIN users u ON u.id = g.owner_id
       WHERE g.id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Not found' });
    }
    return res.json(rows[0]);
  } catch (err) {
    console.error('getGameById error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// Skapa ny annons (kräver inloggning)
export async function createGame(req, res) {
  try {
    const ownerId = req.user.id;
    const {
      title,
      platform,
      description,
      price_sell,
      price_rent_per_month,
      image_url
    } = req.body;

    const [result] = await pool.query(
      `INSERT INTO games
        (owner_id, title, platform, description, price_sell, price_rent_per_month, status, image_url)
       VALUES (?,?,?,?,?,?, 'available', ?)`,
      [
        ownerId,
        title,
        platform || 'Other',
        description || '',
        price_sell || null,
        price_rent_per_month || null,
        image_url || null
      ]
    );

    return res.status(201).json({
      id: result.insertId,
      owner_id: ownerId,
      title,
      platform: platform || 'Other',
      description: description || '',
      price_sell: price_sell || null,
      price_rent_per_month: price_rent_per_month || null,
      status: 'available',
      image_url: image_url || null,
    });
  } catch (err) {
    console.error('createGame error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// Uppdatera annons (ägare eller admin)
export async function updateGame(req, res) {
  try {
    const gameId = req.params.id;

    // hämta gamla värden
    const [rows] = await pool.query('SELECT * FROM games WHERE id = ?', [gameId]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Not found' });
    }
    const game = rows[0];

    // auth-check
    const { role, id: userId } = req.user;
    if (!(role === 'admin' || userId === game.owner_id)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // plocka nya värden från body
    const {
      title,
      platform,
      description,
      price_sell,
      price_rent_per_month,
      status,
      image_url
    } = req.body;

    // uppdatera DB
    await pool.query(
      `UPDATE games
       SET title=?,
           platform=?,
           description=?,
           price_sell=?,
           price_rent_per_month=?,
           status=?,
           image_url=?
       WHERE id=?`,
      [
        title ?? game.title,
        platform ?? game.platform,
        description ?? game.description,
        price_sell ?? game.price_sell,
        price_rent_per_month ?? game.price_rent_per_month,
        status ?? game.status,
        image_url ?? game.image_url,
        gameId
      ]
    );

    return res.json({ message: 'Game updated' });
  } catch (err) {
    console.error('updateGame error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// Ta bort annons (ägare eller admin)
export async function deleteGame(req, res) {
  try {
    const gameId = req.params.id;

    // hämta spelet
    const [rows] = await pool.query('SELECT * FROM games WHERE id = ?', [gameId]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Not found' });
    }
    const game = rows[0];

    // auth-check
    const { role, id: userId } = req.user;
    if (!(role === 'admin' || userId === game.owner_id)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await pool.query('DELETE FROM games WHERE id = ?', [gameId]);

    return res.json({ message: 'Game deleted' });
  } catch (err) {
    console.error('deleteGame error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}
