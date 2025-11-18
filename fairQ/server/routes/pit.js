import express from "express";
const router = express.Router();

import Ticket from "../models/Ticket.js";
import { createPITToken, tokenToQR } from "../utils/pit.js";
import { authenticate }from "../middleware/authMiddleware.js"; // your existing auth middleware

// POST /api/pit/generate
router.post("/generate", authenticate, async (req, res) => {
  try {
    const { ticketId, checklist } = req.body;

    if (!ticketId) {
      return res.status(400).json({ error: "ticketId is required" });
    }

    if (!checklist || checklist.length === 0) {
      return res.status(400).json({ error: "Checklist incomplete" });
    }

    const userId = req.user._id;

    // Find user's ticket
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });

    // Ensure ticket belongs to logged-in user
    if (ticket.customer.toString() !== userId.toString()) {
      return res.status(403).json({ error: "You cannot generate PIT for this ticket" });
    }

    // Create PIT Token
    const { token, expiresAt } = await createPITToken({
      ticketId,
      userId,
      checklistCompleted: true
    });

    // Convert token to QR Code
    const qrCode = await tokenToQR(token);

    // Update ticket PIT info
    ticket.pit.generated = true;
    ticket.pit.generatedAt = new Date();
    ticket.pit.expiresAt = expiresAt;

    await ticket.save();

    return res.json({
      success: true,
      qrCode,
      expiresAt
    });

  } catch (error) {
    console.log("PIT Generation Error:", error);
    res.status(500).json({ error: "Server error generating PIT" });
  }
});

export default router;
