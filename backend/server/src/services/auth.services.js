import jwt from "jsonwebtoken";
import User from "../models/User.js";
import EmailOtp from "../models/EmailOtp.js";
import { sendOtpEmail } from "./mail.service.js";

function generateOtpCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function createTokens(user) {
  const accessToken = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES || "15m" }
  );

  const refreshToken = jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES || "7d" }
  );

  return { accessToken, refreshToken };
}

export async function login({ email, password }) {
  const user = await User.findOne({ email });
  if (!user) throw new Error("Không tồn tại Email");

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new Error("Mật khẩu sai");

  if (user.status !== "active") {
    throw new Error("Tài khoản đã bị vô hiệu hóa");
  }

  const { accessToken, refreshToken } = createTokens(user);

  return { user, accessToken, refreshToken };
}

export async function register({ name, email, password, role }) {
  const existingUser = await User.findOne({ email });
  if (existingUser) throw new Error("Email đã tồn tại");

  const user = new User({ name, email, password, role, status: "inactive" });
  await user.save();

  const otpCode = generateOtpCode();
  const ttlMinutes = Number(process.env.EMAIL_OTP_EXPIRES_MIN || 10);
  const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

  await EmailOtp.findOneAndUpdate(
    { user: user._id },
    {
      user: user._id,
      email: user.email,
      code: otpCode,
      expiresAt,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await sendOtpEmail({
    to: user.email,
    code: otpCode,
    expiresInMinutes: ttlMinutes,
  });

  return { user };
}

export async function verifyOtp({ email, code }) {
  if (!email || !code) {
    throw new Error("Email và mã OTP là bắt buộc");
  }

  const user = await User.findOne({ email });
  if (!user) throw new Error("Không tìm thấy người dùng");

  if (user.status === "active") {
    throw new Error("Tài khoản đã được kích hoạt");
  }

  const otpRecord = await EmailOtp.findOne({ user: user._id });
  if (!otpRecord) throw new Error("OTP không tồn tại");

  if (otpRecord.code !== code) {
    throw new Error("OTP không chính xác");
  }

  if (otpRecord.expiresAt < new Date()) {
    throw new Error("OTP đã hết hạn");
  }

  user.status = "active";
  await user.save();

  await EmailOtp.deleteOne({ _id: otpRecord._id });

  const { accessToken, refreshToken } = createTokens(user);

  return { user, accessToken, refreshToken };
}

export async function resendOtp({ email }) {
  if (!email) {
    throw new Error("Email là bắt buộc");
  }

  const user = await User.findOne({ email });
  if (!user) throw new Error("Không tìm thấy người dùng");

  if (user.status === "active") {
    throw new Error("Tài khoản đã được kích hoạt, không cần gửi OTP");
  }

  const otpCode = generateOtpCode();
  const ttlMinutes = Number(process.env.EMAIL_OTP_EXPIRES_MIN || 10);
  const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

  await EmailOtp.findOneAndUpdate(
    { user: user._id },
    {
      user: user._id,
      email: user.email,
      code: otpCode,
      expiresAt,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await sendOtpEmail({
    to: user.email,
    code: otpCode,
    expiresInMinutes: ttlMinutes,
  });

  return { email: user.email };
}

// Hàm gửi OTP cho quên mật khẩu
export async function forgotPassword({ email }) {
  if (!email) {
    throw new Error("Email là bắt buộc");
  }

  // Tìm user theo email
  const user = await User.findOne({ email });
  if (!user) {
    // Không báo lỗi chi tiết để tránh leak thông tin
    throw new Error("Nếu email tồn tại, chúng tôi đã gửi mã OTP");
  }

  // Kiểm tra tài khoản có active không
  if (user.status !== "active") {
    throw new Error("Tài khoản chưa được kích hoạt");
  }

  // Tạo mã OTP mới
  const otpCode = generateOtpCode();
  const ttlMinutes = Number(process.env.EMAIL_OTP_EXPIRES_MIN || 10);
  const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

  // Lưu OTP vào database (dùng cùng model EmailOtp)
  await EmailOtp.findOneAndUpdate(
    { user: user._id },
    {
      user: user._id,
      email: user.email,
      code: otpCode,
      expiresAt,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  // Gửi email OTP
  await sendOtpEmail({
    to: user.email,
    code: otpCode,
    expiresInMinutes: ttlMinutes,
  });

  return { email: user.email };
}

// Hàm đặt lại mật khẩu sau khi verify OTP
export async function resetPassword({ email, code, newPassword }) {
  if (!email || !code || !newPassword) {
    throw new Error("Email, mã OTP và mật khẩu mới là bắt buộc");
  }

  // Tìm user
  const user = await User.findOne({ email });
  if (!user) throw new Error("Không tìm thấy người dùng");

  // Kiểm tra tài khoản active
  if (user.status !== "active") {
    throw new Error("Tài khoản chưa được kích hoạt");
  }

  // Tìm OTP record
  const otpRecord = await EmailOtp.findOne({ user: user._id });
  if (!otpRecord) throw new Error("OTP không tồn tại hoặc đã hết hạn");

  // Verify OTP
  if (otpRecord.code !== code) {
    throw new Error("Mã OTP không chính xác");
  }

  if (otpRecord.expiresAt < new Date()) {
    throw new Error("Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới");
  }

  // Đổi mật khẩu (User model sẽ tự hash khi save)
  user.password = newPassword;
  await user.save();

  // Xóa OTP đã dùng
  await EmailOtp.deleteOne({ _id: otpRecord._id });

  return { email: user.email };
}