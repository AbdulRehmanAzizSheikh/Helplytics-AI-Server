import express from "express";
import {
  registerUser,
  loginUser,
  onboardUser,
  aiSuggestSkills,
  getProfile,
  updateProfile,
  getLeaderboard,
  getAllUsers,
} from "../controllers/userController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.patch("/:id/onboard", onboardUser);
router.post("/ai-suggest", aiSuggestSkills);
router.get("/leaderboard", getLeaderboard);
router.get("/all", getAllUsers);
router.get("/:id", getProfile);
router.patch("/:id", updateProfile);

export default router;
