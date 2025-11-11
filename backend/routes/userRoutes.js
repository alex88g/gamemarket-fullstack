// routes/userRoutes.js
import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  getMe,
  updateMe,
  deleteMe,
  getWishlist,
  addWishlist,
  removeWishlist,
} from "../controllers/userController.js";

const router = Router();

router.get("/me", requireAuth, getMe);
router.put("/me", requireAuth, updateMe);
router.delete("/me", requireAuth, deleteMe);

router.get("/wishlist", requireAuth, getWishlist);
router.post("/wishlist", requireAuth, addWishlist);
router.delete("/wishlist/:gameId", requireAuth, removeWishlist);

export default router;
