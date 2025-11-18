import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import Ticket from "../models/Ticket.js";

const router = express.Router();

// ==========================
// 1️⃣ CREATE UPLOAD FOLDER
// ==========================
const uploadFolder = "uploads/documents/";
if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder, { recursive: true });
}

// ==========================
// 2️⃣ MULTER STORAGE CONFIG
// ==========================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadFolder);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "_" + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// =====================================
// 3️⃣ MAIN ROUTE — UPLOAD DOCUMENT FILE
// =====================================
router.post(
  "/upload/:ticketId",
  upload.single("file"), // 🔥 MUST MATCH frontend
  async (req, res) => {
    try {
      const { ticketId } = req.params;
      const documentName = req.body.documentName; // Required doc title

      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      // 📌 CREATE PUBLIC URL FOR FILE
      const fileUrl = `/uploads/documents/${req.file.filename}`;

      // 📌 Fetch ticket
      const ticket = await Ticket.findById(ticketId);
      if (!ticket) {
        return res.status(404).json({ error: "Ticket not found" });
      }

      // 📌 Save file info inside ticket.documents
      ticket.documents.push({
        fileName: documentName,
        fileUrl: fileUrl,
      });

      await ticket.save();

      return res.json({
        success: true,
        message: "File uploaded successfully",
        file: {
          fileName: documentName,
          fileUrl,
        },
      });
    } catch (err) {
      console.error("Upload Error:", err);
      res.status(500).json({ error: "Server error uploading document" });
    }
  }
);

export default router;
