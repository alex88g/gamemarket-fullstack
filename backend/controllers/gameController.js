// backend/controllers/gameController.js
import { pool } from '../db.js';

// Hämta alla spel
export async function getAllGames(req, res) {
  try {
    const { rows } = await pool.query(
      `SELECT g.*, u.username AS "ownerName"
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
    const { rows } = await pool.query(
      `SELECT g.*, u.username AS "ownerName"
       FROM games g
       JOIN users u ON u.id = g.owner_id
       WHERE g.id = $1`,
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

// Skapa ny annons
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

    const { rows } = await pool.query(
      `INSERT INTO games
        (owner_id, title, platform, description, price_sell, price_rent_per_month, status, image_url)
       VALUES ($1,$2,$3,$4,$5,$6,'available',$7)
       RETURNING id, owner_id, title, platform, description, price_sell, price_rent_per_month, status, image_url`,
      [
        ownerId,
        title,
        platform || 'Other',
        description || '',
        price_sell ?? null,
        price_rent_per_month ?? null,
        image_url ?? null
      ]
    );

    return res.status(201).json(rows[0]);
  } catch (err) {
    console.error('createGame error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// Uppdatera annons (ägare eller admin)
export async function updateGame(req, res) {
  try {
    const gameId = req.params.id;

    const { rows } = await pool.query('SELECT * FROM games WHERE id = $1', [gameId]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Not found' });
    }
    const game = rows[0];

    const { role, id: userId } = req.user;
    if (!(role === 'admin' || userId === game.owner_id)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const {
      title,
      platform,
      description,
      price_sell,
      price_rent_per_month,
      status,
      image_url
    } = req.body;

    await pool.query(
      `UPDATE games
       SET title=$1,
           platform=$2,
           description=$3,
           price_sell=$4,
           price_rent_per_month=$5,
           status=$6,
           image_url=$7
       WHERE id=$8`,
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

    const { rows } = await pool.query('SELECT * FROM games WHERE id = $1', [gameId]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Not found' });
    }
    const game = rows[0];

    const { role, id: userId } = req.user;
    if (!(role === 'admin' || userId === game.owner_id)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await pool.query('DELETE FROM games WHERE id = $1', [gameId]);

    return res.json({ message: 'Game deleted' });
  } catch (err) {
    console.error('deleteGame error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}
