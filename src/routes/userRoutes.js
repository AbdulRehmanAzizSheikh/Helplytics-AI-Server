import express from "express";
import { createUser } from "../controllers/userController.js";

const router = express.Router();

router.post("/register", createUser);
// Add login if needed, keeping it simple
router.post("/login", (req, res) => {
  res.status(200).json({ message: "Login successful", user: req.body });
});

export default router;
