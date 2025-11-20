import { Routes, Route } from "react-router-dom"; // Import component định tuyến
import LoginPage from "./page/auth/LoginPage"; // Trang đăng nhập
import RegisterPage from "./page/auth/RegisterPage"; // Trang đăng ký
import VerifyEmailPage from "./page/auth/VerifyEmailPage"; // Trang nhập OTP xác thực email
import ForgotPasswordPage from "./page/auth/ForgotPasswordPage"; // Trang quên mật khẩu - nhập email
import ResetPasswordPage from "./page/auth/ResetPasswordPage"; // Trang đặt lại mật khẩu - nhập OTP + mật khẩu mới

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} /> {/* Route login */}
      <Route path="/register" element={<RegisterPage />} />{" "}
      {/* Route register */}
      <Route path="/verify-email" element={<VerifyEmailPage />} />{" "}
      {/* Route xác thực OTP */}
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />{" "}
      {/* Route quên mật khẩu */}
      <Route path="/reset-password" element={<ResetPasswordPage />} />{" "}
      {/* Route đặt lại mật khẩu */}
    </Routes>
  );
}

export default App;
