// backend/routes/cartRoutes.js
import express from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  getMyCart,
  addToCart,
  removeCartItem,
  clearCart,
  checkoutCart,
} from "../controllers/cartController.js";

const router = express.Router();

router.get("/", requireAuth, getMyCart);
router.post("/", requireAuth, addToCart);
router.delete("/:id", requireAuth, removeCartItem);
router.delete("/", requireAuth, clearCart);
router.post("/checkout", requireAuth, checkoutCart);

export default router;
