import dotenv from "dotenv";
import nodemailer from "nodemailer";

// 🔥 Load env FIRST
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// 🔍 Optional debug (remove later)
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.error("❌ EMAIL ENV VARIABLES NOT LOADED");
}

export default transporter;
