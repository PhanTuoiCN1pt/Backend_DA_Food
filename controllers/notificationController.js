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

/**
 * Gửi tự động thông báo thực phẩm sắp hết hạn hoặc quá hạn
 * → Gửi theo hộ gia đình (nếu có) hoặc người dùng cá nhân
 */
exports.autoNotifyExpiringFoods = async (req, res) => {
  try {
    console.log("autoNotifyExpiringFoods START");

    const foods = await Food.find({});
    console.log(`Found ${foods.length} foods`);

    const now = new Date();
    const householdFoodsMap = {}; // { householdId: [food] }
    const userFoodsMap = {}; // { userId: [food] }

    // Gom nhóm theo householdId hoặc userId
    for (const food of foods) {
      if (!food.expiryDate) continue;

      const expiry = new Date(food.expiryDate);
      const diffDays = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));

      if (diffDays <= 2) {
        if (food.householdId) {
          if (!householdFoodsMap[food.householdId])
            householdFoodsMap[food.householdId] = [];
          householdFoodsMap[food.householdId].push({ name: food.name, diffDays });
        } else if (food.userId) {
          if (!userFoodsMap[food.userId])
            userFoodsMap[food.userId] = [];
          userFoodsMap[food.userId].push({ name: food.name, diffDays });
        }
      }
    }

    let totalNotifies = 0;

    /**
     * 🔹 Gửi theo hộ gia đình
     * Giả định: User có field `householdId`
     */
    for (const [householdId, foodsForHouse] of Object.entries(householdFoodsMap)) {
      const members = await User.find({ householdId, fcmToken: { $ne: null } });
      if (!members.length) {
        console.log(`Household ${householdId} has no members with fcmToken`);
        continue;
      }

      const expiringFoods = foodsForHouse
        .filter(f => f.diffDays > 0)
        .map(f => f.name);

      const expiredFoods = foodsForHouse
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

      // Gửi tới tất cả thành viên có fcmToken
      for (const member of members) {
        const message = {
          token: member.fcmToken,
          notification: {
            title: "Cảnh báo thực phẩm trong hộ gia đình",
            body: foodsListStr,
          },
        };
        await admin.messaging().send(message);
        console.log(`Sent notify to member ${member._id} in household ${householdId}`);
        totalNotifies++;
      }
    }

    /**
     * 🔹 Gửi cho user cá nhân (không có household)
     */
    for (const [userId, foodsForUser] of Object.entries(userFoodsMap)) {
      const user = await User.findById(userId);
      if (!user?.fcmToken) continue;

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
        token: user.fcmToken,
        notification: {
          title: "Cảnh báo thực phẩm",
          body: foodsListStr,
        },
      };
      await admin.messaging().send(message);
      console.log(`Sent notify to user ${user._id}`);
      totalNotifies++;
    }

    res.json({
      success: true,
      message: `Đã gửi ${totalNotifies} thông báo cho người dùng & hộ gia đình`,
    });
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

    const user = await User.findByIdAndUpdate(userId, { notifyTime }, { new: true });
    if (!user) return res.status(404).json({ error: "User không tồn tại" });

    res.json({ success: true, notifyTime: user.notifyTime });
  } catch (err) {
    console.error("setNotifyTime ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Gửi tự động theo giờ user cài (cron gọi)
 */
exports.sendAutoNotifyForUser = async (user) => {
  const foods = await Food.find({
    $or: [{ userId: user._id }, { householdId: user.householdId }],
  });

  const now = new Date();
  const foodsForUser = [];

  for (const food of foods) {
    if (!food.expiryDate) continue;

    const expiry = new Date(food.expiryDate);
    const diffDays = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
    if (diffDays <= 2) {
      foodsForUser.push({ name: food.name, diffDays });
    }
  }

  if (!foodsForUser.length) return;

  const expiringFoods = foodsForUser.filter(f => f.diffDays > 0).map(f => f.name);
  const expiredFoods = foodsForUser.filter(f => f.diffDays <= 0).map(f => f.name);

  let foodsListStr = "";
  if (expiringFoods.length > 0)
    foodsListStr += `Thực phẩm sắp hết hạn: ${expiringFoods.join(", ")}`;
  if (expiredFoods.length > 0) {
    if (foodsListStr) foodsListStr += "\n";
    foodsListStr += `Thực phẩm quá hạn: ${expiredFoods.join(", ")}`;
  }

  if (!foodsListStr) return;

  const message = {
    token: user.fcmToken,
    notification: {
      title: "Cảnh báo thực phẩm (theo giờ bạn cài)",
      body: foodsListStr,
    },
  };

  await admin.messaging().send(message);
  console.log(`Sent notify to user ${user._id} at ${user.notifyTime}`);
};
