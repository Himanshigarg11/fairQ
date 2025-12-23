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

dotenv.config();

const app = express();
const server = http.createServer(app);

// ✅ Allowed origins (NO trailing slashes)
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://fairq-amber.vercel.app",
];

// 🔥 Socket.IO
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

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

app.set("io", io);

// 🔥 Express CORS (MUST MATCH Socket CORS)
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

app.use(express.json());
app.use("/uploads", express.static("uploads"));

connectDB();

// Routes
app.get("/", (req, res) =>
  res.json({ message: "FairQ API running", status: "OK" })
);

app.get("/api/health", (req, res) =>
  res.json({ status: "OK", message: "Health check passed" })
);

app.use("/api/auth", authRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/pit", pitRoutes);
app.use("/api/documents", uploadDocsRoutes);
app.use("/api/admin/analytics", adminAnalyticsRoutes);

// 404
app.use((req, res) =>
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  })
);

// ✅ MUST use server.listen for sockets
const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`🚀 Server + Socket.IO running on port ${PORT}`)
);
