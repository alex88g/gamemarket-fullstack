// middleware/auth.js
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'No token' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, username, role }
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

export function requireOwnerOrAdmin(req, res, next) {
  // kallad efter requireAuth
  const { role, id: userId } = req.user;
  const { ownerId } = req; // vi lägger detta i controller när vi laddat spelet

  if (role === 'admin' || userId === ownerId) {
    return next();
  }
  return res.status(403).json({ message: 'Forbidden' });
}

export function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admins only' });
  }
  next();
}
