const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const JWT_SECRET = process.env.JWT_SECRET; 

// Đăng ký
exports.register = async (req, res) => {
  try {
    const { name, email, password, fcmToken } = req.body; // ✅ nhận thêm fcmToken từ client

    // Check trùng email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email đã tồn tại" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      fcmToken: fcmToken || null, // ✅ lưu token device
    });

    await newUser.save();

    // Response (ẩn password)
    res.status(201).json({
      message: "Đăng ký thành công",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        fcmToken: newUser.fcmToken, // ✅ trả về luôn cho chắc
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi server" });
  }
};


// Đăng nhập
exports.login = async (req, res) => {
  try {
    const { email, password, fcmToken } = req.body; // ✅ nhận thêm fcmToken từ client

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Sai email hoặc mật khẩu" });

    // Kiểm tra mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Sai email hoặc mật khẩu" });

    // Nếu có fcmToken mới thì update
    if (fcmToken && user.fcmToken !== fcmToken) {
      user.fcmToken = fcmToken;
      await user.save();
    }

    // Cập nhật lastLogin
     user.lastLogin = new Date();

     await user.save();

    // Tạo token JWT
    const token = jwt.sign({ userId: user._id }, JWT_SECRET);

    res.json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email,
        fcmToken: user.fcmToken,
        lastLogin: user.lastLogin
      } 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Đăng xuất (client chỉ cần xóa token phía frontend)
// Nếu muốn "logout server-side" thì ta có thể lưu token blacklist
exports.logout = async (req, res) => {
  res.json({ message: "Đăng xuất thành công, vui lòng xóa token ở client" });
};


// Đổi password
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User không tồn tại" });

    // Kiểm tra mật khẩu cũ
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ error: "Mật khẩu cũ không đúng" });

    // Hash mật khẩu mới
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Đổi mật khẩu thành công" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi server" });
  }
};

// 1. Gửi mail reset
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "Email không tồn tại" });

    // Tạo token
    const token = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 phút
    await user.save();

    // Gửi email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const resetUrl = `http://localhost:5000/api/users/reset-password/${token}`;
    await transporter.sendMail({
      to: user.email,
      from: process.env.EMAIL_USER,
      subject: "Đặt lại mật khẩu",
      html: `<p>Bạn đã yêu cầu đặt lại mật khẩu</p>
             <p>Bấm vào link để đổi mật khẩu: <a href="${resetUrl}">${resetUrl}</a></p>`
    });

    res.json({ message: "Đã gửi link reset mật khẩu qua email" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. Reset mật khẩu
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ error: "Token không hợp lệ hoặc đã hết hạn" });

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Mật khẩu đã được đặt lại thành công" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};