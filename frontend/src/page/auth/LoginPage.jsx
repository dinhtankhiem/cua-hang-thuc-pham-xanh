import { useState } from "react"; // Import hook useState để tạo state trong component
import axios from "axios"; // Import axios để thực hiện gọi API HTTP
import "../../App.css"; // Import file CSS dùng chung cho giao diện đăng nhập

// Định nghĩa hằng số URL nền tảng của API; ưu tiên lấy từ biến môi trường
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

function LoginPage() {
  // Khởi tạo state formValues để giữ giá trị email và mật khẩu người dùng nhập
  const [formValues, setFormValues] = useState({
    email: "",
    password: "",
  });

  // Khởi tạo state status để theo dõi trạng thái tải, lỗi và thành công
  const [status, setStatus] = useState({
    loading: false,
    error: "",
    success: "",
  });

  // Hàm handleChange xử lý mọi sự kiện khi người dùng gõ vào input
  const handleChange = (event) => {
    setFormValues((previousValues) => ({
      ...previousValues, // Sao chép toàn bộ giá trị cũ để tránh mất dữ liệu
      [event.target.name]: event.target.value, // Cập nhật trường tương ứng với input đang thay đổi
    }));
  };

  // Hàm handleSubmit chịu trách nhiệm gửi dữ liệu đăng nhập lên server
  const handleSubmit = async (event) => {
    event.preventDefault(); // Ngăn chặn hành vi reload mặc định của form
    setStatus({ loading: true, error: "", success: "" }); // Thiết lập trạng thái đang tải

    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/login`, // Endpoint đăng nhập trên backend
        {
          email: formValues.email.trim(), // Cắt khoảng trắng trước khi gửi email
          password: formValues.password, // Truyền thẳng mật khẩu như người dùng nhập
        },
        { withCredentials: true } // Cho phép gửi cookie nếu server sử dụng session
      );

      setStatus({
        loading: false, // Tắt trạng thái loading sau khi có phản hồi
        error: "", // Xóa thông báo lỗi (nếu có)
        success: `Xin chào ${
          response.data?.user?.name || response.data?.user?.email
        }!`, // Hiển thị lời chào dựa trên thông tin trả về
      });
    } catch (error) {
      const message =
        error.response?.data?.message || // Lấy thông điệp lỗi cụ thể từ server
        error.message || // Fallback sang message mặc định của axios
        "Đăng nhập thất bại. Vui lòng thử lại."; // Thông báo chung nếu không xác định được lỗi

      setStatus({ loading: false, error: message, success: "" }); // Cập nhật trạng thái lỗi
    }
  };

  return (
    <div className="login-page">
      {/* Khối chứa form đăng nhập */}
      <div className="login-card">
        <div className="login-card__header">
          <p className="eyebrow">Cửa Hàng Thực Phẩm Xanh</p>
          <h1>Đăng nhập hệ thống</h1>
          <p className="subtitle">
            Quản lý đơn hàng, hàng hóa và đội ngũ chỉ với một lần đăng nhập.
          </p>
        </div>

        {/* Form đăng nhập */}
        <form className="login-form" onSubmit={handleSubmit}>
          <label htmlFor="email">Email</label>
          <input
            id="email" // Gắn id để label tham chiếu đúng input
            name="email" // Thuộc tính name để handleChange xác định trường
            type="email" // Kiểu email giúp trình duyệt kiểm tra định dạng
            placeholder="admin@example.com" // Placeholder gợi ý tài khoản demo
            value={formValues.email} // Giá trị hiện tại của input
            onChange={handleChange} // Gọi handleChange khi người dùng nhập
            required // Bắt buộc nhập email trước khi submit
          />

          <label htmlFor="password">Mật khẩu</label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            value={formValues.password}
            onChange={handleChange}
            required
          />

          <button type="submit" disabled={status.loading}>
            {status.loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        {/* Hiển thị thông báo lỗi */}
        {status.error && <p className="alert error">{status.error}</p>}

        {/* Hiển thị thông báo thành công */}
        {status.success && <p className="alert success">{status.success}</p>}

        {/* Link quên mật khẩu */}
        <p style={{ textAlign: "center", marginTop: "0.75rem" }}>
          <a
            href="/forgot-password"
            style={{
              color: "#22c55e",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Quên mật khẩu?
          </a>
        </p>

        <p className="login-hint">
          Tài khoản demo: <strong>admin@example.com</strong> /{" "}
          <strong>Admin@123</strong>
        </p>
      </div>

      {/* Khối giới thiệu bên phải giao diện */}
      <div className="login-aside">
        <h2>Thực phẩm sạch mỗi ngày</h2>
        <p>
          Cập nhật tình trạng hàng hóa, theo dõi doanh thu realtime và phân
          quyền cho từng nhân viên với hệ thống quản trị MERN.
        </p>
        <ul>
          <li>Phân quyền manager / staff / customer</li>
          <li>Báo cáo tồn kho và doanh thu</li>
          <li>Tích hợp ứng dụng di động trong tương lai</li>
        </ul>
      </div>
    </div>
  );
}

export default LoginPage; // Xuất component để có thể import ở nơi khác
