import express from "express";
import jwt from "jsonwebtoken";
import Ticket from "../models/Ticket.js";
import { createPITToken, tokenToQR } from "../utils/pit.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();
const SECRET = process.env.JWT_SECRET || "pit_secret_key";

/* ============================================================
   1️⃣  GENERATE PIT (CUSTOMER ONLY)
============================================================ */
router.post("/generate", authenticate, authorize("Customer"), async (req, res) => {
  try {
    const { ticketId, checklist } = req.body;

    if (!ticketId) return res.status(400).json({ error: "ticketId is required" });
    if (!checklist || checklist.length === 0)
      return res.status(400).json({ error: "Checklist incomplete" });

    const userId = req.user._id;

    // Make sure ticket exists & belongs to customer
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });

    if (ticket.customer.toString() !== userId.toString()) {
      return res.status(403).json({ error: "Not your ticket" });
    }

    // Create PIT JWT
    const { token, expiresAt } = await createPITToken({
      ticketId,
      userId,
      checklistCompleted: true,
    });

    const qrCode = await tokenToQR(token);

    // Update ticket PIT info
    ticket.pit.generated = true;
    ticket.pit.generatedAt = new Date();
    ticket.pit.expiresAt = expiresAt;

    await ticket.save();

    return res.json({
      success: true,
      qrCode,
      expiresAt,
    });
  } catch (error) {
    console.log("PIT Generation Error:", error);
    return res.status(500).json({ error: "Server error generating PIT" });
  }
});

/* ============================================================
   2️⃣  VALIDATE PIT (STAFF ONLY)
   ✔ Decodes JWT
   ✔ Checks PIT expiration
   ✔ Updates ticket.status → "Processing"
============================================================ */
router.post("/validate", authenticate, authorize("Staff", "Admin"), async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ valid: false, error: "Token missing" });
    }

    // Decode PIT Token
    let decoded;
    try {
      decoded = jwt.verify(token, SECRET);
    } catch (err) {
      return res.status(400).json({ valid: false, error: "Invalid or expired QR" });
    }

    // Fetch Ticket
    const ticket = await Ticket.findById(decoded.ticketId).populate("customer");

    if (!ticket) {
      return res.status(404).json({ valid: false, error: "Ticket not found" });
    }

    // Check if PIT expired
    if (ticket.pit.expiresAt && ticket.pit.expiresAt < new Date()) {
      return res.status(401).json({ valid: false, error: "PIT expired" });
    }

    // ⭐ AUTO-UPDATE Ticket Status
    if (ticket.status === "Pending") {
      ticket.status = "Processing";
      ticket.processedAt = new Date();
      await ticket.save();
    }

    return res.json({
      valid: true,
      ticket,
      message: "PIT verified & ticket status updated!",
    });
  } catch (error) {
    console.log("PIT VALIDATION ERROR:", error);
    return res.status(500).json({ valid: false, error: "Server error validating PIT" });
  }
});

export default router;