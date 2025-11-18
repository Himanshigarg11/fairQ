import express from 'express';
import {
  bookTicket,
  getCustomerTickets,
  getAllTickets,
  updateTicketStatus,
  getTicketById,
  getTicketStats
} from '../controllers/ticketController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Customer routes
router.post('/book', authenticate, authorize('Customer'), bookTicket);
router.get('/my-tickets', authenticate, authorize('Customer'), getCustomerTickets);
router.get('/:ticketId', authenticate, getTicketById);

// Staff/Admin routes
router.get('/', authenticate, authorize('Staff', 'Admin'), getAllTickets);
router.put('/:ticketId/status', authenticate, authorize('Staff', 'Admin'), updateTicketStatus);
router.get('/admin/stats', authenticate, authorize('Admin'), getTicketStats);

export default router;
