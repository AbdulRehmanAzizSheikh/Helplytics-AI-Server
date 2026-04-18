import express from "express";
import { createRequest, getRequests, getRequestById, addHelper, markAsSolved, analyzeContent } from "../controllers/requestController.js";

const router = express.Router();

router.post("/analyze", analyzeContent);
router.post("/", createRequest);
router.get("/", getRequests);
router.get("/:id", getRequestById);
router.post("/:id/help", addHelper);
router.patch("/:id/solve", markAsSolved);

export default router;
