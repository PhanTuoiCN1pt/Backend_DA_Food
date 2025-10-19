const express = require("express");
const cors = require("cors");
const cron = require("node-cron");
require("dotenv").config();

const notifyController = require("./controllers/notificationController");
const moment = require("moment-timezone");
const User = require("./models/userModel");
const connectDB = require("./config/db.js");

const foodRoutes = require("./routes/foodRoutes.js");
const authRoutes = require("./routes/authRoutes.js");
const userRoutes = require("./routes/userRoutes.js");
const recipeRoutes = require("./routes/recipesRoutes.js");
const adminRecipeRoutes = require("./routes/adminRecipeRoutes");
const cartRoutes = require("./routes/cartRoutes.js");
const notificationRoutes = require("./routes/notificationRoutes.js");
const categoryRoutes = require("./routes/categoryRoutes");
const householdRoutes = require("./routes/householeRoutes");
const fcmRoutes = require("./routes/fcmRoutes");

const app = express();
const bodyParser = require("body-parser");

// -------------------- Middleware --------------------
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
app.use("/api/households", householdRoutes);
app.use("/api/fcm", fcmRoutes);

// -------------------- Cron Job --------------------
cron.schedule(
  "* * * * *",
  async () => {
    const now = moment().tz("Asia/Ho_Chi_Minh").format("HH:mm");
    console.log("Kiểm tra thực phẩm hết hạn -", now);

    try {
      const users = await User.find({ notifyTime: now });

      for (const user of users) {
        if (user.fcmToken) {
          await notifyController.sendAutoNotifyForUser(user);
        } else {
          console.log(`User ${user._id} không có fcmToken`);
        }
      }
    } catch (err) {
      console.error("[NODE-CRON] [ERROR]", err);
    }
  },
  {
    timezone: "Asia/Ho_Chi_Minh",
  }
);

// -------------------- Chạy server --------------------
app.listen(3000, () => {
  console.log("🚀 Server chạy tại http://localhost:3000");
});
