const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Không có token, từ chối truy cập" });
  }

  const token = authHeader.split(" ")[1]; // lấy phần token sau Bearer

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // gắn vào req để dùng ở controller
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token không hợp lệ" });
  }
};
