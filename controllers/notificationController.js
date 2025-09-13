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
        console.log("✅ Sent direct notification:", response);

        res.json({ success: true, response });
    } catch (err) {
        console.error("❌ sendNotification ERROR:", err.message);
        res.status(500).json({ error: err.message });
    }
};

/**
 * Quét database → tìm food sắp hết hạn → gửi notification cho user
 */
// exports.autoNotifyExpiringFoods = async (req, res) => {
//     try {
//         console.log("🔔 autoNotifyExpiringFoods START");

//         const foods = await Food.find({});
//         console.log(`📦 Found ${foods.length} foods`);

//         const now = new Date();

//         // Tạo 1 object lưu danh sách food sắp hết hạn theo user
//         const userFoodsMap = {};

//         for (const food of foods) {
//             if (!food.expiryDate) continue;

//             const expiry = new Date(food.expiryDate);
//             const diffDays = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));

//             if (diffDays <= 2) {
//                 if (!userFoodsMap[food.userId]) userFoodsMap[food.userId] = [];
//                 userFoodsMap[food.userId].push({ name: food.name, diffDays });
//             }
//         }

//         let totalNotifies = 0;

//         // Gửi 1 thông báo cho mỗi user, liệt kê tất cả food
//         for (const userId of Object.keys(userFoodsMap)) {
//             const user = await User.findById(userId);
//             if (!user?.fcmToken) {
//                 console.log(`⚠️ User ${userId} has no fcmToken`);
//                 continue;
//             }

//             // Tách foods thành 2 nhóm
//             const expiringFoods = userFoodsMap[userId]
//                 .filter(f => f.diffDays > 0)
//                 .map(f => f.name);

//             const expiredFoods = userFoodsMap[userId]
//                 .filter(f => f.diffDays <= 0)
//                 .map(f => f.name);

//             // Ghép chuỗi, dùng dấu phẩy
//             let foodsListStr = "";
//             if (expiringFoods.length > 0) {
//                 foodsListStr += `Thực phẩm sắp hết hạn: ${expiringFoods.join(", ")}`;
//             }
//             if (expiredFoods.length > 0) {
//                 if (foodsListStr) foodsListStr += "\n"; // xuống dòng giữa 2 nhóm
//                 foodsListStr += `Thực phẩm quá hạn: ${expiredFoods.join(", ")}`;
//             }

//             if (!foodsListStr) continue; // không có gì thì bỏ qua

//             const message = {
//                 token: user.fcmToken,
//                 notification: {
//                     title: "⚠️ Cảnh báo thực phẩm",
//                     body: foodsListStr,
//                 },
//             };

//             await admin.messaging().send(message);
//             console.log(`✅ Sent 1 notification to user ${user._id}`);
//             totalNotifies++;
//         }



//         res.json({ success: true, message: `Đã gửi ${totalNotifies} thông báo gộp` });
//     } catch (err) {
//         console.error("❌ autoNotifyExpiringFoods ERROR:", err.message);
//         res.status(500).json({ error: err.message });
//     }
// };

exports.autoNotifyExpiringFoods = async (req, res) => {
  try {
    console.log("🔔 autoNotifyExpiringFoods START");

    const foods = await Food.find({});
    console.log(`📦 Found ${foods.length} foods`);

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
        console.log(`⚠️ User ${userId} has no fcmToken`);
        continue;
      }

      const existing = tokenUserMap[user.fcmToken];
      if (!existing || (user.lastLogin && user.lastLogin > existing.lastLogin)) {
        tokenUserMap[user.fcmToken] = user; // 🔥 chọn user có lastLogin mới hơn
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
          title: "⚠️ Cảnh báo thực phẩm",
          body: foodsListStr,
        },
      };

      await admin.messaging().send(message);
      console.log(`✅ Sent notify to user ${user._id} (last login)`);
      totalNotifies++;
    }

    res.json({ success: true, message: `Đã gửi ${totalNotifies} thông báo (lastLogin filter)` });
  } catch (err) {
    console.error("❌ autoNotifyExpiringFoods ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
};
