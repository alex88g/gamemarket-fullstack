// backend/routes/adminRoutes.js
import { Router } from "express";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import {
  getAllGamesAdmin,
  adminUpdateGame,
} from "../controllers/adminController.js";
import { getAllOrders } from "../controllers/orderController.js";

const router = Router();

// alla annonser med ägare
router.get("/games", requireAuth, requireAdmin, getAllGamesAdmin);

// ändra annons (t.ex. status = 'blocked' eller 'available')
router.put("/games/:id", requireAuth, requireAdmin, adminUpdateGame);

// alla ordrar i systemet
router.get("/orders", requireAuth, requireAdmin, getAllOrders);

export default router;
