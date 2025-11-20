import {
  login as loginService,
  register as registerService,
  verifyOtp as verifyOtpService,
  resendOtp as resendOtpService,
  forgotPassword as forgotPasswordService,
  resetPassword as resetPasswordService,
} from "../services/auth.services.js";

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email và mật khẩu là bắt buộc" });
    }

    const { user, accessToken, refreshToken } = await loginService({ email, password });

    // tuỳ cách lưu token: trả JSON hoặc set cookie
    res.json({
      message: "Đăng nhập thành công",
      user: {
        id: user._id,
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
}

export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Tên, email và mật khẩu là bắt buộc" });
    }

    const { user } = await registerService({
      name,
      email,
      password,
    });

    res.status(201).json({
      message: "Đăng ký thành công. Vui lòng kiểm tra email để nhận mã OTP.",
      user: {
        id: user._id,
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function verifyOtp(req, res, next) {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res
        .status(400)
        .json({ message: "Email và mã OTP là bắt buộc" });
    }

    const { user, accessToken, refreshToken } = await verifyOtpService({
      email,
      code,
    });

    res.json({
      message: "Xác thực email thành công",
      user: {
        id: user._id,
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
}

export async function resendOtp(req, res, next) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email là bắt buộc" });
    }

    await resendOtpService({ email });

    res.json({
      message: "Đã gửi lại mã OTP. Vui lòng kiểm tra email của bạn.",
    });
  } catch (error) {
    next(error);
  }
}

// Controller xử lý quên mật khẩu - gửi OTP về email
export async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email là bắt buộc" });
    }

    await forgotPasswordService({ email });

    // Trả về message chung để tránh leak thông tin (không báo email có tồn tại hay không)
    res.json({
      message: "Nếu email tồn tại, chúng tôi đã gửi mã OTP. Vui lòng kiểm tra email của bạn.",
    });
  } catch (error) {
    next(error);
  }
}

// Controller xử lý đặt lại mật khẩu sau khi verify OTP
export async function resetPassword(req, res, next) {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res
        .status(400)
        .json({ message: "Email, mã OTP và mật khẩu mới là bắt buộc" });
    }

    // Validate độ dài mật khẩu
    if (newPassword.length < 8) {
      return res
        .status(400)
        .json({ message: "Mật khẩu phải có ít nhất 8 ký tự" });
    }

    await resetPasswordService({ email, code, newPassword });

    res.json({
      message: "Đặt lại mật khẩu thành công. Bạn có thể đăng nhập với mật khẩu mới.",
    });
  } catch (error) {
    next(error);
  }
}