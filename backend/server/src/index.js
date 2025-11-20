import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

import authRoutes from "./routes/auth.routes.js";

// Lấy đường dẫn thư mục chứa file hiện tại (server/src)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env từ thư mục backend (2 cấp lên từ server/src)
dotenv.config({ path: join(__dirname, "../../.env") });

// Debug: Log SMTP config sau khi dotenv đã load (hỗ trợ cả MAIL_* và EMAIL_*)
const mailHost = process.env.MAIL_HOST || process.env.EMAIL_HOST;
const mailPort = process.env.MAIL_PORT || process.env.EMAIL_PORT;
const mailUser = process.env.MAIL_USERNAME || process.env.EMAIL_USER;
const mailPass = process.env.MAIL_PASSWORD || process.env.EMAIL_PASS;

console.log("[Mail Service Debug] MAIL_HOST/EMAIL_HOST:", mailHost || "CHƯA CÓ");
console.log("[Mail Service Debug] MAIL_PORT/EMAIL_PORT:", mailPort || "CHƯA CÓ");
console.log("[Mail Service Debug] MAIL_USERNAME/EMAIL_USER:", mailUser || "CHƯA CÓ");
console.log("[Mail Service Debug] MAIL_PASSWORD/EMAIL_PASS:", mailPass ? "***ĐÃ CÓ***" : "CHƯA CÓ");

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Bạn đã thử đăng nhập quá nhiều lần. Vui lòng thử lại sau.",
  },
});

app.use(helmet());
app.use(
  cors({
    origin: CLIENT_ORIGIN,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.use("/auth", authLimiter, authRoutes);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    message: err.message || "Đã xảy ra lỗi hệ thống",
  });
});

async function startServer() {
  if (!process.env.MONGO_URI) {
    console.error("Missing MONGO_URI in environment variables");
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: process.env.MONGO_DB_NAME,
    });
    console.log("MongoDB connected");

    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
}

startServer();
