import express from "express";
import { register, login, getProfile, saveFcmToken } from "../controllers/authController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile", authenticate, getProfile);

// ✅ THIS MUST EXIST
router.post("/save-fcm-token", authenticate, saveFcmToken);

export default router;
