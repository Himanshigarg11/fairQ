import express from "express";
import {
  getTicketStats,
  getDailyTickets,
  getAvgProcessingTime
} from "../controllers/adminAnalyticsController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/stats", authenticate, authorize("Admin"), getTicketStats);
router.get("/daily", authenticate, authorize("Admin"), getDailyTickets);
router.get("/avg-time", authenticate, authorize("Admin"), getAvgProcessingTime);

export default router;
