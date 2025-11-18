// server/routes/tickets.js
import express from 'express';
import multer from 'multer';
import {
  bookTicket,
  getCustomerTickets,
  getAllTickets,
  updateTicketStatus,
  getTicketById,
  getTicketStats,
  uploadDocuments   // this must match the name exported from controller
} from '../controllers/ticketController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { getSortedQueue } from "../controllers/ticketController.js";

const router = express.Router();

// configure multer (temporary storage)
const upload = multer({ dest: 'uploads/' }); // you can later swap to cloud storage

// Document upload route (customer uploads files for a ticket)
router.post(
  '/:ticketId/upload-documents',
  authenticate,
  authorize('Customer'),
  upload.array('files', 5), // form field name "files", up to 5 files
  uploadDocuments
);

// Customer routes
router.post('/book', authenticate, authorize('Customer'), bookTicket);
router.get('/my-tickets', authenticate, authorize('Customer'), getCustomerTickets);
router.get('/:ticketId', authenticate, getTicketById);

// Staff/Admin routes
router.get('/', authenticate, authorize('Staff', 'Admin'), getAllTickets);
router.put('/:ticketId/status', authenticate, authorize('Staff', 'Admin'), updateTicketStatus);
router.get('/admin/stats', authenticate, authorize('Admin'), getTicketStats);

router.get("/queue/:serviceType/sorted", authenticate, authorize("Staff", "Admin"), getSortedQueue);

export default router;
