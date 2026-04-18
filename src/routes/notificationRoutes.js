import express from "express";
import {
  getNotifications,
  markAsRead,
  markAllRead,
} from "../controllers/notificationController.js";

const router = express.Router();

router.get("/:userId", getNotifications);
router.patch("/:id/read", markAsRead);
router.patch("/:userId/read-all", markAllRead);

export default router;
