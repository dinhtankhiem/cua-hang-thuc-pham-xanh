import { useState, useEffect } from "react"; // Import hook useState & useEffect để quản lý state và side-effect
import { useSearchParams, useNavigate } from "react-router-dom"; // Hook đọc query param và điều hướng trang
import axios from "axios"; // Thư viện gọi API HTTP
import "../../App.css"; // Tái sử dụng style chung của các trang auth

// URL gốc của backend, ưu tiên biến môi trường Vite
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

function VerifyEmailPage() {
  const navigate = useNavigate(); // Hook điều hướng sau khi xác thực thành công
  const [searchParams] = useSearchParams(); // Hook đọc query string (vd: ?email=demo@example.com)

  // State lưu giá trị form: email người dùng và mã OTP
  const [formValues, setFormValues] = useState({
    email: "",
    code: "",
  });

  // State cho trạng thái gửi OTP: loading/error/success để hiển thị thông báo
  const [status, setStatus] = useState({
    loading: false,
    error: "",
    success: "",
  });

  // State riêng cho nút resend để tránh spam, có thể hiển thị countdown sau này
  const [resendLoading, setResendLoading] = useState(false);

  // Khi component mount, thử lấy email từ query string để tự điền vào ô email
  useEffect(() => {
    const emailFromQuery = searchParams.get("email") || "";
    if (emailFromQuery) {
      setFormValues((prev) => ({ ...prev, email: emailFromQuery }));
    }
  }, [searchParams]);

  // Hàm cập nhật state khi người dùng nhập vào input
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Hàm submit form: gửi email + code lên endpoint /auth/verify-otp
  const handleSubmit = async (event) => {
    event.preventDefault(); // Ngăn reload trang khi submit form
    setStatus({ loading: true, error: "", success: "" }); // Reset trạng thái trước khi gọi API

    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/verify-otp`, // Endpoint xác thực OTP trên backend
        {
          email: formValues.email.trim(), // Cắt khoảng trắng email trước khi gửi
          code: formValues.code.trim(), // Cắt khoảng trắng mã OTP
        }
      );

      setStatus({
        loading: false,
        error: "",
        success: response.data?.message || "Xác thực thành công!", // Thông báo trả về cho người dùng
      });

      // Sau 1.5s điều hướng về trang đăng nhập để user đăng nhập lại
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Không thể xác thực OTP. Vui lòng thử lại.";

      setStatus({ loading: false, error: message, success: "" });
    }
  };

  // Hàm gửi lại OTP: gọi endpoint /auth/resend-otp với email hiện tại
  const handleResendOtp = async () => {
    if (!formValues.email.trim()) {
      setStatus({
        loading: false,
        error: "Vui lòng nhập email trước khi yêu cầu gửi lại OTP.",
        success: "",
      });
      return;
    }

    setResendLoading(true); // Đánh dấu nút resend đang hoạt động
    setStatus({ loading: false, error: "", success: "" }); // Xoá thông báo cũ để tránh nhiễu

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/resend-otp`, {
        email: formValues.email.trim(),
      });

      setStatus({
        loading: false,
        error: "",
        success: response.data?.message || "Đã gửi lại mã OTP thành công.",
      });
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Không thể gửi lại OTP. Thử lại sau ít phút.";

      setStatus({ loading: false, error: message, success: "" });
    } finally {
      setResendLoading(false); // Kết thúc trạng thái resend
    }
  };

  return (
    <div className="login-page">
      {/* Khối form chính cho việc nhập email + OTP */}
      <div className="login-card">
        <div className="login-card__header">
          <p className="eyebrow">Cửa Hàng Thực Phẩm Xanh</p>
          <h1>Xác thực email</h1>
          <p className="subtitle">
            Nhập mã OTP 6 chữ số đã được gửi về email của bạn.
          </p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="admin@example.com"
            value={formValues.email}
            onChange={handleChange}
            required
          />

          <label htmlFor="code">Mã OTP</label>
          <input
            id="code"
            name="code"
            type="text"
            placeholder="Nhập 6 chữ số"
            maxLength={6}
            value={formValues.code}
            onChange={handleChange}
            required
          />

          <button type="submit" disabled={status.loading}>
            {status.loading ? "Đang xác thực..." : "Xác nhận OTP"}
          </button>
        </form>

        {/* Nút gửi lại OTP - đặt ngay dưới form, style đẹp */}
        <div style={{ textAlign: "center", marginTop: "0.75rem" }}>
          <button
            type="button"
            className="link-button"
            onClick={handleResendOtp}
            disabled={resendLoading}
          >
            {resendLoading ? "Đang gửi lại..." : "Gửi lại mã OTP"}
          </button>
        </div>

        {/* Hiển thị thông báo lỗi */}
        {status.error && <p className="alert error">{status.error}</p>}

        {/* Hiển thị thông báo thành công */}
        {status.success && <p className="alert success">{status.success}</p>}
      </div>

      {/* Phần mô tả bên phải giữ nguyên bố cục với các trang auth khác */}
      <div className="login-aside">
        <h2>Bảo vệ tài khoản của bạn</h2>
        <p>
          OTP chỉ có hiệu lực trong vài phút để đảm bảo an toàn. Đừng chia sẻ mã
          này với bất kỳ ai.
        </p>
        <ul>
          <li>Mỗi OTP chỉ sử dụng một lần</li>
          <li>Hết hạn sau 5-10 phút tùy cấu hình</li>
          <li>Có thể yêu cầu gửi lại nếu mã cũ hết hạn</li>
        </ul>
      </div>
    </div>
  );
}

export default VerifyEmailPage; // Xuất component để khai báo route
