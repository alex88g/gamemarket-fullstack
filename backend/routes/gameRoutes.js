import { Router } from "express";
import {
  getAllGames,
  getGameById,
  createGame,
  updateGame,
  deleteGame,
} from "../controllers/gameController.js";

import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/", getAllGames);
router.get("/:id", getGameById);

router.post("/", requireAuth, createGame);
router.put("/:id", requireAuth, updateGame);
router.delete("/:id", requireAuth, deleteGame);

export default router;
