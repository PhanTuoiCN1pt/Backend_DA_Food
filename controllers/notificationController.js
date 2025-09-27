const Food = require("../models/foodModel");
const User = require("../models/userModel");
const admin = require("../config/firebase");

/**
 * Gửi notification trực tiếp tới 1 thiết bị (test nhanh)
 * Body cần: { fcmToken, title, body }
 */
exports.sendNotification = async (req, res) => {
    try {
        const { fcmToken, title, body } = req.body;

        if (!fcmToken) {
            return res.status(400).json({ error: "Thiếu fcmToken" });
        }

        const message = {
            token: fcmToken,
            notification: {
                title: title || "Thông báo mới",
                body: body || "Bạn có một tin nhắn",
            },
        };

        const response = await admin.messaging().send(message);
        console.log("Sent direct notification:", response);

        res.json({ success: true, response });
    } catch (err) {
        console.error("sendNotification ERROR:", err.message);
        res.status(500).json({ error: err.message });
    }
};


exports.autoNotifyExpiringFoods = async (req, res) => {
  try {
    console.log("autoNotifyExpiringFoods START");

    const foods = await Food.find({});
    console.log(`Found ${foods.length} foods`);

    const now = new Date();
    const userFoodsMap = {};

    for (const food of foods) {
      if (!food.expiryDate) continue;

      const expiry = new Date(food.expiryDate);
      const diffDays = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));

      if (diffDays <= 2) {
        if (!userFoodsMap[food.userId]) userFoodsMap[food.userId] = [];
        userFoodsMap[food.userId].push({ name: food.name, diffDays });
      }
    }

    let totalNotifies = 0;
    const tokenUserMap = {}; // { fcmToken: user }

    // Lấy user + check lastLogin
    for (const userId of Object.keys(userFoodsMap)) {
      const user = await User.findById(userId);
      if (!user?.fcmToken) {
        console.log(`User ${userId} has no fcmToken`);
        continue;
      }

      const existing = tokenUserMap[user.fcmToken];
      if (!existing || (user.lastLogin && user.lastLogin > existing.lastLogin)) {
        tokenUserMap[user.fcmToken] = user; // chọn user có lastLogin mới hơn
      }
    }

    // Gửi thông báo cho từng fcmToken (chỉ user đăng nhập sau cùng)
    for (const [fcmToken, user] of Object.entries(tokenUserMap)) {
      const foodsForUser = userFoodsMap[user._id] || [];
      if (!foodsForUser.length) continue;

      const expiringFoods = foodsForUser
        .filter(f => f.diffDays > 0)
        .map(f => f.name);

      const expiredFoods = foodsForUser
        .filter(f => f.diffDays <= 0)
        .map(f => f.name);

      let foodsListStr = "";
      if (expiringFoods.length > 0) {
        foodsListStr += `Thực phẩm sắp hết hạn: ${expiringFoods.join(", ")}`;
      }
      if (expiredFoods.length > 0) {
        if (foodsListStr) foodsListStr += "\n";
        foodsListStr += `Thực phẩm quá hạn: ${expiredFoods.join(", ")}`;
      }

      if (!foodsListStr) continue;

      const message = {
        token: fcmToken,
        notification: {
          title: "Cảnh báo thực phẩm",
          body: foodsListStr,
        },
      };

      await admin.messaging().send(message);
      console.log(`Sent notify to user ${user._id} (last login)`);
      totalNotifies++;
    }

    res.json({ success: true, message: `Đã gửi ${totalNotifies} thông báo (lastLogin filter)` });
  } catch (err) {
    console.error("autoNotifyExpiringFoods ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// POST /api/notification/set-time
exports.setNotifyTime = async (req, res) => {
  try {
    const { userId, notifyTime } = req.body;

    if (!notifyTime || !/^\d{2}:\d{2}$/.test(notifyTime)) {
      return res.status(400).json({ error: "Giờ không hợp lệ (HH:mm)" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { notifyTime },
      { new: true }
    );

    if (!user) return res.status(404).json({ error: "User không tồn tại" });

    res.json({ success: true, notifyTime: user.notifyTime });
  } catch (err) {
    console.error("setNotifyTime ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
};

exports.sendAutoNotifyForUser = async (user) => {
  // Lấy tất cả thực phẩm của user
  const foods = await Food.find({ userId: user._id });

  const now = new Date();
  const foodsForUser = [];

  for (const food of foods) {
    if (!food.expiryDate) continue;

    const expiry = new Date(food.expiryDate);
    const diffDays = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));

    // Chỉ notify các food sắp hết hạn (<=2 ngày)
    if (diffDays <= 2) {
      foodsForUser.push({ name: food.name, diffDays });
    }
  }

  if (!foodsForUser.length) return;

  // Phân loại sắp hết hạn và quá hạn
  const expiringFoods = foodsForUser
    .filter(f => f.diffDays > 0)
    .map(f => f.name);

  const expiredFoods = foodsForUser
    .filter(f => f.diffDays <= 0)
    .map(f => f.name);

  let foodsListStr = "";
  if (expiringFoods.length > 0) {
    foodsListStr += `Thực phẩm sắp hết hạn: ${expiringFoods.join(", ")}`;
  }
  if (expiredFoods.length > 0) {
    if (foodsListStr) foodsListStr += "\n"; // xuống dòng nếu có cả 2 loại
    foodsListStr += `Thực phẩm quá hạn: ${expiredFoods.join(", ")}`;
  }

  if (!foodsListStr) return;

  // Gửi notification qua FCM
  const message = {
    token: user.fcmToken,
    notification: {
      title: "Cảnh báo thực phẩm",
      body: foodsListStr,
    },
  };

  await admin.messaging().send(message);
  console.log(`Sent notify to user ${user._id} at ${user.notifyTime}`);
};

