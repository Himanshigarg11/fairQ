import jwt from "jsonwebtoken";
import QRCode from "qrcode";

const SECRET = process.env.JWT_SECRET || "pit_secret_key";

// Create PIT JWT Token
export const createPITToken = async (payload) => {
  const token = jwt.sign(payload, SECRET, { expiresIn: "2h" });

  const decoded = jwt.decode(token);
  const expiresAt = new Date(decoded.exp * 1000);

  return { token, expiresAt };
};

// Convert token → QR code (base64 string)
export const tokenToQR = async (token) => {
  return await QRCode.toDataURL(token);
};
