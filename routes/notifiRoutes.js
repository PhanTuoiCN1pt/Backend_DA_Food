const express = require("express");
const router = express.Router();
const admin = require("../firebase");
const User = require("../models/userModel");
const Food = require("../models/foodModel");

router.post("/notify-expired-food/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    const foods = await Food.find({ userId });

    // Lọc món ăn sắp hết hạn (trong 2 ngày)
    const soonExpired = foods.filter(food => {
      const now = new Date();
      const expire = new Date(food.expiryDate);
      const diff = (expire - now) / (1000 * 60 * 60 * 24);
      return diff <= 2; 
    });

    if (soonExpired.length === 0) {
      return res.json({ message: "Không có món ăn sắp hết hạn" });
    }

    const message = {
      notification: {
        title: "Thực phẩm sắp hết hạn",
        body: `Có ${soonExpired.length} món ăn sắp hết hạn, kiểm tra ngay!`,
      },
      token: user.fcmToken, 
    };

    await admin.messaging().send(message);

    res.json({ success: true, message: "Đã gửi thông báo" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi gửi thông báo" });
  }
});

// Lưu token FCM cho user
router.post("/save-token", async (req, res) => {
  try {
    const { userId, fcmToken } = req.body;

    if (!userId || !fcmToken) {
      return res.status(400).json({ msg: "Thiếu userId hoặc fcmToken" });
    }

    // Update user với token mới
    await User.findByIdAndUpdate(userId, { fcmToken }, { new: true });

    res.json({ msg: "Lưu FCM token thành công" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

module.exports = router;
