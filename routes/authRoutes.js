const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", authMiddleware, authController.logout);
router.post("/change-password", authMiddleware, authController.changePassword);

router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password/:token", authController.resetPassword);


// Protected route (chỉ đăng nhập mới vào được)
router.get("/profile", authMiddleware, (req, res) => {
  res.json({ message: "Xin chào, bạn đã đăng nhập!", userId: req.user.userId });
});

module.exports = router;

