import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";

import connectDB from "./config/db.js";
import uploadDocsRoutes from "./routes/uploadDocument.js";
import authRoutes from "./routes/auth.js";
import ticketRoutes from "./routes/tickets.js";
import pitRoutes from "./routes/pit.js";
import adminAnalyticsRoutes from "./routes/adminAnalytics.js";

// Load env variables
dotenv.config();

// Initialize express
const app = express();

// Create HTTP server
const server = http.createServer(app);

// 🔥 Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

// 🔌 Socket connection
io.on("connection", (socket) => {
  console.log("🔵 Socket connected:", socket.id);

  socket.on("joinRoom", (userId) => {
    socket.join(userId);
    console.log(`User joined room: ${userId}`);
  });

  socket.on("disconnect", () => {
    console.log("🔴 Socket disconnected:", socket.id);
  });
});

// Make io accessible in routes/controllers
app.set("io", io);

// Connect DB
connectDB();

// Middleware
app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Default routes
app.get("/", (req, res) =>
  res.json({ message: "FairQ API running", status: "OK" })
);
app.get("/api/health", (req, res) =>
  res.json({ status: "OK", message: "Health check passed" })
);

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/pit", pitRoutes);
app.use("/api/documents", uploadDocsRoutes);
app.use("/api/admin/analytics", adminAnalyticsRoutes);

// 404 Handler
app.use((req, res) =>
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  })
);

// Start server (IMPORTANT: use server.listen, not app.listen)
const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`🚀 Server + Socket.IO running on port ${PORT}`)
);
