import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import uploadDocsRoutes from "./routes/uploadDocument.js";

import authRoutes from './routes/auth.js';
import ticketRoutes from './routes/tickets.js';
import pitRoutes from "./routes/pit.js";  // <-- moved here (AFTER imports)

// Load environment variables
dotenv.config();

// Initialize express
const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors({ 
  origin: ['http://localhost:5173'], 
  credentials: true 
}));

app.use(express.json());
app.use("/uploads", express.static("uploads")); 
// Default routes
app.get('/', (req, res) => res.json({ message: 'FairQ API running', status: 'OK' }));
app.get('/api/health', (req, res) => res.json({ status: 'OK', message: 'Health check passed' }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use("/api/pit", pitRoutes); // <-- FIXED: moved AFTER app is created
app.use("/uploads", express.static("uploads"));
app.use("/api/documents", uploadDocsRoutes);
// 404 Handler
app.use((req, res) => 
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`
  })
);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
