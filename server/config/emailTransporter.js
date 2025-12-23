import nodemailer from "nodemailer";

// 🔴 Fail fast if env vars are missing
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.error("❌ EMAIL_USER or EMAIL_PASS is missing");
}

// ✅ Gmail SMTP (RENDER SAFE)
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,        // ✅ REQUIRED
  secure: true,     // ✅ MUST be true for port 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Gmail App Password
  },
});

// 🔍 Verify connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Email transporter verification failed:", error);
  } else {
    console.log("✅ Email transporter is ready");
  }
});

export default transporter;
