import { useState, useEffect } from "react"; // Import hook useState & useEffect để quản lý state và side-effect
import { useSearchParams, useNavigate } from "react-router-dom"; // Hook đọc query param và điều hướng trang
import axios from "axios"; // Thư viện gọi API HTTP
import "../../App.css"; // Tái sử dụng style chung của các trang auth

// URL gốc của backend, ưu tiên biến môi trường Vite
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

function ResetPasswordPage() {
  const navigate = useNavigate(); // Hook điều hướng sau khi đặt lại mật khẩu thành công
  const [searchParams] = useSearchParams(); // Hook đọc query string (vd: ?email=demo@example.com)

  // State lưu giá trị form: email, mã OTP, mật khẩu mới và xác nhận mật khẩu
  const [formValues, setFormValues] = useState({
    email: "", // Email từ query string hoặc người dùng nhập
    code: "", // Mã OTP 6 chữ số
    newPassword: "", // Mật khẩu mới
    confirmPassword: "", // Xác nhận lại mật khẩu mới
  });

  // State cho trạng thái gửi request: loading/error/success để hiển thị thông báo
  const [status, setStatus] = useState({
    loading: false, // true khi đang gửi request
    error: "", // Lưu thông điệp lỗi
    success: "", // Lưu thông điệp thành công
  });

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

  // Hàm submit form: gửi email + OTP + mật khẩu mới lên endpoint /auth/reset-password
  const handleSubmit = async (event) => {
    event.preventDefault(); // Ngăn reload trang khi submit form
    setStatus({ loading: true, error: "", success: "" }); // Reset trạng thái trước khi gọi API

    // Validate mật khẩu và xác nhận mật khẩu phải khớp
    if (formValues.newPassword !== formValues.confirmPassword) {
      setStatus({
        loading: false,
        error: "Mật khẩu và xác nhận mật khẩu không khớp.",
        success: "",
      });
      return;
    }

    // Validate độ dài mật khẩu
    if (formValues.newPassword.length < 8) {
      setStatus({
        loading: false,
        error: "Mật khẩu phải có ít nhất 8 ký tự.",
        success: "",
      });
      return;
    }

    try {
      // Gọi endpoint đặt lại mật khẩu trên backend
      const response = await axios.post(
        `${API_BASE_URL}/auth/reset-password`, // Endpoint đặt lại mật khẩu
        {
          email: formValues.email.trim(), // Cắt khoảng trắng email trước khi gửi
          code: formValues.code.trim(), // Cắt khoảng trắng mã OTP
          newPassword: formValues.newPassword, // Mật khẩu mới
        }
      );

      setStatus({
        loading: false,
        error: "",
        success: response.data?.message || "Đặt lại mật khẩu thành công!", // Thông báo trả về cho người dùng
      });

      // Sau 2 giây điều hướng về trang đăng nhập để user đăng nhập với mật khẩu mới
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      const message =
        error.response?.data?.message || // Lấy message từ server
        error.message || // Fallback sang message chung
        "Không thể đặt lại mật khẩu. Vui lòng thử lại."; // Thông báo mặc định

      setStatus({ loading: false, error: message, success: "" });
    }
  };

  return (
    <div className="login-page">
      {/* Khối form chính cho việc nhập email + OTP + mật khẩu mới */}
      <div className="login-card">
        <div className="login-card__header">
          <p className="eyebrow">Cửa Hàng Thực Phẩm Xanh</p>
          <h1>Đặt lại mật khẩu</h1>
          <p className="subtitle">Nhập mã OTP và mật khẩu mới của bạn.</p>
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

          <label htmlFor="newPassword">Mật khẩu mới</label>
          <input
            id="newPassword"
            name="newPassword"
            type="password"
            placeholder="Tối thiểu 8 ký tự"
            value={formValues.newPassword}
            onChange={handleChange}
            required
            minLength={8}
          />

          <label htmlFor="confirmPassword">Xác nhận mật khẩu mới</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="Nhập lại mật khẩu mới"
            value={formValues.confirmPassword}
            onChange={handleChange}
            required
            minLength={8}
          />

          <button type="submit" disabled={status.loading}>
            {status.loading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
          </button>
        </form>

        {/* Hiển thị thông báo lỗi */}
        {status.error && <p className="alert error">{status.error}</p>}

        {/* Hiển thị thông báo thành công */}
        {status.success && <p className="alert success">{status.success}</p>}

        {/* Link quay lại trang đăng nhập */}
        <p
          className="login-hint"
          style={{ textAlign: "center", marginTop: "1rem" }}
        >
          Nhớ mật khẩu?{" "}
          <a href="/login" style={{ color: "#22c55e", fontWeight: 600 }}>
            Đăng nhập
          </a>
        </p>
      </div>

      {/* Phần mô tả bên phải giữ nguyên bố cục với các trang auth khác */}
      <div className="login-aside">
        <h2>Bảo mật tài khoản</h2>
        <p>
          Sau khi đặt lại mật khẩu thành công, bạn có thể đăng nhập ngay với mật
          khẩu mới. Hãy nhớ mật khẩu của bạn.
        </p>
        <ul>
          <li>Mật khẩu tối thiểu 8 ký tự</li>
          <li>Nên kết hợp chữ hoa, chữ thường và số</li>
          <li>Không chia sẻ mật khẩu với bất kỳ ai</li>
        </ul>
      </div>
    </div>
  );
}

export default ResetPasswordPage; // Xuất component để khai báo route
