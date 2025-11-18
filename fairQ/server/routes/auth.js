import express from 'express';
import { register, login, getProfile } from '../controllers/authController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// Test route
router.get('/test', (req, res) => res.json({ message: 'Auth routes working' }));

// Auth endpoints
router.post('/register', register);
router.post('/login', login);
router.get('/profile', authenticate, getProfile);

export default router;
