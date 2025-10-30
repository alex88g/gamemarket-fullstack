// controllers/userController.js
import { pool } from '../db.js';
import bcrypt from 'bcryptjs';

export async function getMe(req, res) {
  try {
    const [rows] = await pool.query(
      'SELECT id, username, email, role, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json(rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
}

export async function updateMe(req, res) {
  try {
    const { username, email, password } = req.body;

    if (!username || !email) {
      return res.status(400).json({ message: 'username and email are required' });
    }

    // Check so you don't change to existing names or emails
    const [dupes] = await pool.query(
      'SELECT id FROM users WHERE (email = ? OR username = ?) AND id <> ?',
      [email, username, req.user.id]
    );
    if (dupes.length > 0) {
      return res.status(400).json({ message: 'Email or username already in use' });
    }

    let sql = 'UPDATE users SET username = ?, email = ?';
    const params = [username, email];

    if (password && password.length >= 6) {
      const hash = await bcrypt.hash(password, 10);
      sql += ', password_hash = ?';
      params.push(hash);
    }

    sql += ' WHERE id = ?';
    params.push(req.user.id);

    await pool.query(sql, params);

    const [rows] = await pool.query(
      'SELECT id, username, email, role, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    return res.json(rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
}

export async function deleteMe(req, res) {
  try {
    const [result] = await pool.query('DELETE FROM users WHERE id = ?', [req.user.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.sendStatus(204);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
}
