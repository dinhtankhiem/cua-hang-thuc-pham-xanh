import { useState } from "react"; // Import hook useState để quản lý state trong function component
import { useNavigate } from "react-router-dom"; // Import hook useNavigate để điều hướng trang sau khi gửi OTP thành công
import axios from "axios"; // Import thư viện axios để thực hiện các request HTTP đến backend
import "../../App.css"; // Tái sử dụng stylesheet chung cho các trang auth

// Xác định URL gốc của API, ưu tiên lấy từ biến môi trường để dễ cấu hình
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

function ForgotPasswordPage() {
  const navigate = useNavigate(); // Hook điều hướng để chuyển sang trang đặt lại mật khẩu sau khi gửi OTP thành công

  // State lưu trữ giá trị email người dùng nhập vào form
  const [formValues, setFormValues] = useState({
    email: "", // Trường email để gửi OTP
  });

  // State quản lý trạng thái quá trình gửi OTP (đang xử lý, lỗi, hoặc thành công)
  const [status, setStatus] = useState({
    loading: false, // true khi request đang được gửi
    error: "", // Lưu thông điệp lỗi trả về
    success: "", // Lưu thông điệp thành công
  });

  // Handler cập nhật state formValues mỗi khi input thay đổi
  const handleChange = (event) => {
    setFormValues((previousValues) => ({
      ...previousValues, // Sao chép giá trị cũ để giữ nguyên các trường khác
      [event.target.name]: event.target.value, // Ghi đè trường tương ứng với input đang thao tác
    }));
  };

  // Handler submit: gọi API gửi OTP về email
  const handleSubmit = async (event) => {
    event.preventDefault(); // Ngăn form reload lại trang
    setStatus({ loading: true, error: "", success: "" }); // Reset trạng thái trước khi gửi request

    try {
      // Gọi endpoint quên mật khẩu - gửi OTP về email
      await axios.post(
        `${API_BASE_URL}/auth/forgot-password`, // Endpoint gửi OTP quên mật khẩu trên backend
        {
          email: formValues.email.trim(), // Cắt khoảng trắng email trước khi gửi
        }
      );

      setStatus({
        loading: false, // Tắt trạng thái loading khi request hoàn tất
        error: "", // Không có lỗi
        success: "Đã gửi mã OTP. Vui lòng kiểm tra email của bạn.", // Thông điệp thành công
      });

      // Sau 1.5 giây chuyển hướng sang trang đặt lại mật khẩu với email trong query string
      setTimeout(() => {
        navigate(
          `/reset-password?email=${encodeURIComponent(formValues.email.trim())}`
        );
      }, 1500);
    } catch (error) {
      const message =
        error.response?.data?.message || // Lấy message chi tiết từ server
        error.message || // Fallback sang message chung của axios
        "Không thể gửi OTP. Vui lòng thử lại."; // Thông báo chung nếu không xác định được lỗi

      setStatus({
        loading: false, // Tắt trạng thái loading
        error: message, // Hiển thị lỗi để người dùng biết
        success: "", // Xóa thông báo thành công (nếu có)
      });
    }
  };

  return (
    <div className="login-page">
      {/* Khối form chính dành cho quên mật khẩu */}
      <div className="login-card">
        <div className="login-card__header">
          <p className="eyebrow">Cửa Hàng Thực Phẩm Xanh</p>
          <h1>Quên mật khẩu</h1>
          <p className="subtitle">
            Nhập email của bạn để nhận mã OTP đặt lại mật khẩu.
          </p>
        </div>

        {/* Form quên mật khẩu với trường email */}
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

          <button type="submit" disabled={status.loading}>
            {status.loading ? "Đang gửi..." : "Gửi mã OTP"}
          </button>
        </form>

        {/* Thông báo lỗi/ thành công */}
        {status.error && <p className="alert error">{status.error}</p>}
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

      {/* Phần giới thiệu bên cạnh form để giữ bố cục consistent */}
      <div className="login-aside">
        <h2>Khôi phục tài khoản</h2>
        <p>
          Chúng tôi sẽ gửi mã OTP 6 chữ số về email của bạn để xác thực trước
          khi cho phép đặt lại mật khẩu.
        </p>
        <ul>
          <li>Mã OTP có hiệu lực trong 10 phút</li>
          <li>Chỉ sử dụng một lần</li>
          <li>Bảo mật thông tin tài khoản của bạn</li>
        </ul>
      </div>
    </div>
  );
}

export default ForgotPasswordPage; // Xuất component để sử dụng trong router hoặc App chính
