const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET; // nên lưu trong biến môi trường .env

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // "Bearer token"

  if (!token) return res.status(401).json({ message: "Không có token" });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Token không hợp lệ" });
    req.user = decoded; // { userId: ... }
    next();
  });
};

module.exports = authMiddleware;
