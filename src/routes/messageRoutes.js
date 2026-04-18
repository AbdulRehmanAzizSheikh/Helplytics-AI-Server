import express from "express";
import { sendMessage, getMessages, getAllMessages } from "../controllers/messageController.js";

const router = express.Router();

router.post("/", sendMessage);
router.get("/all", getAllMessages);
router.get("/:userId", getMessages);

export default router;
