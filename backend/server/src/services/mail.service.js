import nodemailer from "nodemailer";

// Biến lưu transporter (lazy initialization - tạo khi cần)
let transporter = null;

// Hàm tạo transporter khi cần (sau khi dotenv đã load)
function getTransporter() {
  // Nếu đã tạo rồi thì trả về
  if (transporter) {
    return transporter;
  }

  // Hỗ trợ cả MAIL_* và EMAIL_* (ưu tiên MAIL_*)
  const host = process.env.MAIL_HOST || process.env.EMAIL_HOST;
  const port = process.env.MAIL_PORT || process.env.EMAIL_PORT;
  const username = process.env.MAIL_USERNAME || process.env.EMAIL_USER;
  const password = process.env.MAIL_PASSWORD || process.env.EMAIL_PASS;
  const secure = process.env.MAIL_SECURE || process.env.EMAIL_SECURE;
  const from = process.env.MAIL_FROM || process.env.EMAIL_FROM;

  // Kiểm tra xem SMTP đã được cấu hình đầy đủ chưa
  const isSmtpConfigured = !!host && !!port && !!username && !!password;

  if (isSmtpConfigured) {
    transporter = nodemailer.createTransport({
      host: host,
      port: Number(port),
      secure: secure === "true", // true = port 465, false = 587/STARTTLS
      auth: {
        user: username,
        pass: password.replace(/\s/g, ""), // Bỏ khoảng trắng trong App Password
      },
    });
    return transporter;
  }

  return null;
}

/**
 * Gửi email OTP qua SMTP (SendGrid, Mailgun, SES...).
 * - SendGrid: MAIL_HOST=smtp.sendgrid.net, MAIL_USERNAME=apikey, MAIL_PASSWORD=<API_KEY>
 * - Mailgun: MAIL_HOST=smtp.mailgun.org, MAIL_USERNAME=postmaster@<domain>, MAIL_PASSWORD=<SMTP_PASSWORD>
 * - SES: MAIL_HOST=email-smtp.<region>.amazonaws.com, MAIL_USERNAME=<SMTP_USER>, MAIL_PASSWORD=<SMTP_PASS>
 */
export async function sendOtpEmail({ to, code, expiresInMinutes }) {
  if (!to || !code) {
    throw new Error("Thiếu thông tin email hoặc mã OTP");
  }

  const subject = "Mã xác thực OTP";
  const text = `Mã OTP của bạn là ${code}. Mã hết hạn sau ${expiresInMinutes} phút.`;
  const html = `
    <p>Chào bạn,</p>
    <p>Mã OTP của bạn là <strong style="font-size:20px;">${code}</strong>.</p>
    <p>Mã sẽ hết hạn sau ${expiresInMinutes} phút. Nếu bạn không yêu cầu hành động này, hãy bỏ qua email.</p>
  `;

  // Lấy transporter (tạo mới nếu chưa có, sau khi dotenv đã load)
  const mailTransporter = getTransporter();

  if (!mailTransporter) {
    console.warn(
      `[Mail Service] SMTP chưa được cấu hình. OTP ${code} gửi đến ${to}.`
    );
    return;
  }

  try {
    // Log thông tin trước khi gửi
    console.log(`[Mail Service] Đang gửi OTP ${code} đến ${to}...`);
    
    // Lấy địa chỉ FROM (hỗ trợ cả MAIL_FROM và EMAIL_FROM)
    const fromAddress =
      process.env.MAIL_FROM ||
      process.env.EMAIL_FROM ||
      `"Cửa Hàng Thực Phẩm Xanh" <no-reply@thucphamxanh.local>`;

    const info = await mailTransporter.sendMail({
      from: fromAddress,
      to,
      subject,
      text,
      html,
    });

    // Log thành công
    console.log(`[Mail Service] ✅ Email đã được gửi thành công! MessageId: ${info.messageId}`);
    console.log(`[Mail Service] Response: ${info.response}`);
  } catch (error) {
    // Log lỗi chi tiết
    console.error(`[Mail Service] ❌ Lỗi khi gửi email đến ${to}:`, error.message);
    console.error(`[Mail Service] Error code:`, error.code);
    console.error(`[Mail Service] Error response:`, error.response);
    
    // Ném lỗi để controller xử lý
    throw new Error(`Không thể gửi email: ${error.message}`);
  }
}

