import express from "express";
import {
  analyzeContent,
  createRequest,
  getRequests,
  getRequestById,
  addHelper,
  markAsSolved,
  deleteRequest,
  getAiInsights,
} from "../controllers/requestController.js";

const router = express.Router();

router.post("/analyze", analyzeContent);
router.get("/ai-insights", getAiInsights);
router.post("/", createRequest);
router.get("/", getRequests);
router.get("/:id", getRequestById);
router.post("/:id/help", addHelper);
router.patch("/:id/solve", markAsSolved);
router.delete("/:id", deleteRequest);

export default router;
