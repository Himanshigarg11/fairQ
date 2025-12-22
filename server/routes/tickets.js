// server/routes/tickets.js
import express from "express";
import multer from "multer";

import {
  bookTicket,
  getCustomerTickets,
  getAllTickets,
  updateTicketStatus,
  getTicketById,
  getTicketStats,
  uploadDocuments,
  getSortedQueue,
} from "../controllers/ticketController.js";

import { authenticate, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// ----------------------
// Multer config
// ----------------------
const upload = multer({ dest: "uploads/" });

// ----------------------
// CUSTOMER ROUTES
// ----------------------

// Book ticket
router.post(
  "/book",
  authenticate,
  authorize("Customer"),
  bookTicket
);

// Get logged-in customer's tickets
router.get(
  "/my-tickets",
  authenticate,
  authorize("Customer"),
  getCustomerTickets
);

// Upload documents for a ticket
router.post(
  "/:ticketId/upload-documents",
  authenticate,
  authorize("Customer"),
  upload.array("files", 5),
  uploadDocuments
);

// Get single ticket by ID
router.get(
  "/:ticketId",
  authenticate,
  getTicketById
);

// ----------------------
// STAFF / ADMIN ROUTES
// ----------------------

// Get all tickets (filters via query: status, organization)
router.get(
  "/",
  authenticate,
  authorize("Staff", "Admin"),
  getAllTickets
);

// Update ticket status (THIS TRIGGERS SOCKET EVENT)
router.put(
  "/:ticketId/status",
  authenticate,
  authorize("Staff", "Admin"),
  updateTicketStatus
);

// Sorted queue (used by staff dashboard)
router.get(
  "/queue/:serviceType/sorted",
  authenticate,
  authorize("Staff", "Admin"),
  getSortedQueue
);

// ----------------------
// ADMIN ROUTES
// ----------------------
router.get(
  "/admin/stats",
  authenticate,
  authorize("Admin"),
  getTicketStats
);

export default router;
