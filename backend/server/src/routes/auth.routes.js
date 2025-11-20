import { Router } from "express";
import {
  login,
  register,
  verifyOtp,
  resendOtp,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.controller.js";

const router = Router();

router.post("/login", login);
router.post("/register", register);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);
router.post("/forgot-password", forgotPassword); // Endpoint quên mật khẩu - gửi OTP
router.post("/reset-password", resetPassword); // Endpoint đặt lại mật khẩu - verify OTP + đổi mật khẩu

export default router;