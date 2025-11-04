// backend/controllers/adminController.js
import { pool } from "../db.js";

// GET /api/admin/games
export async function getAllGamesAdmin(req, res) {
  try {
    const { rows } = await pool.query(`
      SELECT g.*,
             u.username AS "ownerName"
      FROM games g
      JOIN users u ON u.id = g.owner_id
      ORDER BY g.created_at DESC
    `);
    return res.json(rows);
  } catch (err) {
    console.error("getAllGamesAdmin error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

// PUT /api/admin/games/:id
export async function adminUpdateGame(req, res) {
  try {
    const gameId = req.params.id;

    const { rows } = await pool.query("SELECT * FROM games WHERE id = $1", [
      gameId,
    ]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Game not found" });
    }
    const current = rows[0];

    const {
      title,
      platform,
      description,
      price_sell,
      price_rent_per_month,
      status,
      image_url,
    } = req.body;

    const nextData = {
      title: title ?? current.title,
      platform: platform ?? current.platform,
      description: description ?? current.description,
      price_sell: price_sell ?? current.price_sell,
      price_rent_per_month:
        price_rent_per_month ?? current.price_rent_per_month,
      status: status ?? current.status,
      image_url: image_url ?? current.image_url,
    };

    await pool.query(
      `
      UPDATE games
      SET title = $1,
          platform = $2,
          description = $3,
          price_sell = $4,
          price_rent_per_month = $5,
          status = $6,
          image_url = $7
      WHERE id = $8
      `,
      [
        nextData.title,
        nextData.platform,
        nextData.description,
        nextData.price_sell,
        nextData.price_rent_per_month,
        nextData.status,
        nextData.image_url,
        gameId,
      ],
    );

    return res.json({ message: "Game updated by admin" });
  } catch (err) {
    console.error("adminUpdateGame error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}
