import { useState } from "react"; // Import hook useState để quản lý state trong function component
import { useNavigate } from "react-router-dom"; // Import hook useNavigate để điều hướng trang sau khi đăng ký thành công
import axios from "axios"; // Import thư viện axios để thực hiện các request HTTP đến backend
import "../../App.css"; // Tái sử dụng stylesheet chung cho các trang auth

// Xác định URL gốc của API, ưu tiên lấy từ biến môi trường để dễ cấu hình
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

function RegisterPage() {
  const navigate = useNavigate(); // Hook điều hướng để chuyển sang trang xác nhận email sau khi đăng ký thành công

  // State lưu trữ giá trị người dùng nhập vào form đăng ký
  const [formValues, setFormValues] = useState({
    name: "", // Trường tên người dùng
    email: "", // Trường email đăng ký
    password: "", // Trường mật khẩu
    confirmPassword: "", // Trường xác nhận lại mật khẩu
  });

  // State quản lý trạng thái quá trình đăng ký (đang xử lý, lỗi, hoặc thành công)
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

  // Handler submit: skeleton để bạn hoàn thiện gọi API đăng ký
  const handleSubmit = async (event) => {
    event.preventDefault(); // Ngăn form reload lại trang
    setStatus({ loading: true, error: "", success: "" }); // Reset trạng thái trước khi gửi request

    try {
      // TODO: Thực hiện validate password và confirmPassword trước khi gọi API

      // Gọi endpoint đăng ký người dùng mới
      await axios.post(
        `${API_BASE_URL}/auth/register`, // Endpoint giả định phía backend
        {
          name: formValues.name.trim(), // Cắt khoảng trắng ở tên
          email: formValues.email.trim(), // Cắt khoảng trắng ở email
          password: formValues.password, // Gửi mật khẩu người dùng nhập
          confirmPassword: formValues.confirmPassword, // Gửi kèm để backend kiểm tra
        },
        { withCredentials: true } // Cho phép cookie/session nếu backend cấu hình
      );

      setStatus({
        loading: false, // Tắt trạng thái loading khi request hoàn tất
        error: "", // Không có lỗi
        success: "Đăng ký thành công! Đang chuyển đến trang xác nhận email...", // Thông điệp thông báo
      });

      // Sau 1.5 giây chuyển hướng sang trang xác nhận email với email trong query string
      setTimeout(() => {
        navigate(
          `/verify-email?email=${encodeURIComponent(formValues.email.trim())}`
        );
      }, 1500);
    } catch (error) {
      const message =
        error.response?.data?.message || // Lấy message chi tiết từ server
        error.message || // Fallback sang message chung của axios
        "Đăng ký thất bại. Vui lòng thử lại."; // Thông báo chung nếu không xác định được lỗi

      setStatus({
        loading: false, // Tắt trạng thái loading
        error: message, // Hiển thị lỗi để người dùng biết
        success: "", // Xóa thông báo thành công (nếu có)
      });
    }
  };

  return (
    <div className="login-page">
      {/* Khối form chính dành cho đăng ký */}
      <div className="login-card">
        <div className="login-card__header">
          <p className="eyebrow">Cửa Hàng Thực Phẩm Xanh</p>
          <h1>Tạo tài khoản mới</h1>
          <p className="subtitle">
            Nhập thông tin cơ bản để gia nhập hệ thống quản trị MERN.
          </p>
        </div>

        {/* Form đăng ký với các trường cơ bản */}
        <form className="login-form" onSubmit={handleSubmit}>
          <label htmlFor="name">Họ và tên</label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="Nguyễn Văn A"
            value={formValues.name}
            onChange={handleChange}
            required
          />

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

          <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="Nhập lại mật khẩu"
            value={formValues.confirmPassword}
            onChange={handleChange}
            required
          />

          <button type="submit" disabled={status.loading}>
            {status.loading ? "Đang đăng ký..." : "Đăng ký"}
          </button>
        </form>

        {/* Thông báo lỗi/ thành công */}
        {status.error && <p className="alert error">{status.error}</p>}
        {status.success && <p className="alert success">{status.success}</p>}
      </div>

      {/* Phần giới thiệu bên cạnh form để giữ bố cục consistent */}
      <div className="login-aside">
        <h2>Đồng hành cùng nông sản sạch</h2>
        <p>
          Sau khi đăng ký, bạn có thể quản lý cửa hàng, nhân sự và báo cáo chỉ
          trong một dashboard duy nhất.
        </p>
        <ul>
          <li>Quản trị tài khoản linh hoạt</li>
          <li>Nhật ký hoạt động chi tiết</li>
          <li>Tính năng bảo mật hai lớp (sắp ra mắt)</li>
        </ul>
      </div>
    </div>
  );
}

export default RegisterPage; // Xuất component để sử dụng trong router hoặc App chính
