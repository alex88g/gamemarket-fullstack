// routes/userRoutes.js
import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { getMe, updateMe, deleteMe } from "../controllers/userController.js";

const router = Router();

router.get("/me", requireAuth, getMe);
router.put("/me", requireAuth, updateMe);
router.delete("/me", requireAuth, deleteMe);

export default router;
