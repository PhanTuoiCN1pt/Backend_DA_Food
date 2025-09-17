const express = require("express");
const cors = require("cors");
const cron = require("node-cron");
require("dotenv").config();

const notifyController = require("./controllers/notificationController");
const moment = require("moment");
const User = require("./models/userModel");

// Chạy lúc 10h sáng và 5h chiều mỗi ngày

// cron.schedule("22 17,18 * * *", async () => {
//   console.log("⏰ Cron job: auto notify expiring foods");
//   try {
//     await notifyController.autoNotifyExpiringFoods(
//       { body: {} }, // fake req
//       { 
//         json: (data) => console.log("✅ Auto notify result:", data),
//         status: (code) => ({ json: (data) => console.log(`❌ Error ${code}:`, data) })
//       }
//     );
//   } catch (err) {
//     console.error("❌ Cron job error:", err.message);
//   }
// });

// Cron job chạy mỗi phút
cron.schedule("* * * * *", async () => {
  const now = moment().tz("Asia/Ho_Chi_Minh").format("HH:mm");
  console.log("⏰ Check notify job at (VN time)", now);

  try {
    const users = await User.find({ notifyTime: now });

    for (const user of users) {
      if (user.fcmToken) {
        await notifyController.sendAutoNotifyForUser(user);
      } else {
        console.log(`⚠️ User ${user._id} không có fcmToken`);
      }
    }
  } catch (err) {
    console.error("[NODE-CRON] [ERROR]", err);
  }
}, {
  timezone: "Asia/Ho_Chi_Minh"
});



const connectDB = require("./config/db.js"); 

const foodRoutes = require("./routes/foodRoutes.js");
const authRoutes = require("./routes/authRoutes.js");
const userRoutes = require("./routes/userRoutes.js");
const recipeRoutes = require("./routes/recipesRoutes.js"); 
const adminRecipeRoutes = require("./routes/adminRecipeRoutes");
const cartRoutes = require("./routes/cartRoutes.js");
const notificationRoutes = require("./routes/notificationRoutes.js");
const app = express();
const bodyParser = require("body-parser");
const fcmRoutes = require("./routes/fcmRoutes");
const categoryRoutes = require("./routes/categoryRoutes");


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

// -------------------- Connect DB --------------------
connectDB();

// -------------------- Routes --------------------
app.use("/api/foods", foodRoutes);
app.use("/api/auths", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/recipes", recipeRoutes); 
app.use("/admin/recipes", adminRecipeRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/notify", notificationRoutes);
app.use("/api/categories", categoryRoutes);


// FCM routes
app.use("/api/fcm", fcmRoutes);

const PORT = 5000;
app.listen(PORT, () => console.log(`Server chạy tại http://localhost:${PORT}`));
