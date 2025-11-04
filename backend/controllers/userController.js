// controllers/userController.js
import { pool } from "../db.js";
import bcrypt from "bcryptjs";

export async function getMe(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "No auth user" });

    const { rows } = await pool.query(
      "SELECT id, username, email, role, created_at FROM users WHERE id = $1",
      [userId],
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json(rows[0]);
  } catch (err) {
    console.error("getMe error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function updateMe(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "No auth user" });

    const { username, email, password } = req.body;

    if (!username || !email) {
      return res
        .status(400)
        .json({ message: "username and email are required" });
    }

    // Kolla dubletter (e-post eller användarnamn) hos någon annan
    const dupes = await pool.query(
      "SELECT id FROM users WHERE (email = $1 OR username = $2) AND id <> $3",
      [email, username, userId],
    );
    if (dupes.rows.length > 0) {
      return res
        .status(400)
        .json({ message: "Email or username already in use" });
    }

    // Bygg dynamisk UPDATE med numrerade parametrar ($1, $2, ...)
    const setClauses = ["username = $1", "email = $2"];
    const params = [username, email];
    let idx = 3;

    if (password && password.length >= 6) {
      const hash = await bcrypt.hash(password, 10);
      setClauses.push(`password_hash = $${idx}`);
      params.push(hash);
      idx++;
    }

    params.push(userId);
    const sql = `UPDATE users SET ${setClauses.join(", ")} WHERE id = $${idx}`;

    await pool.query(sql, params);

    // Returnera uppdaterad användare
    const { rows } = await pool.query(
      "SELECT id, username, email, role, created_at FROM users WHERE id = $1",
      [userId],
    );

    return res.json(rows[0]);
  } catch (err) {
    console.error("updateMe error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function deleteMe(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "No auth user" });

    const result = await pool.query("DELETE FROM users WHERE id = $1", [
      userId,
    ]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.sendStatus(204);
  } catch (err) {
    console.error("deleteMe error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}
