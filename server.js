const express = require("express");
const cors = require("cors");
const cron = require("node-cron");
require("dotenv").config();

const notifyController = require("./controllers/notificationController");

// Chạy lúc 10h sáng và 5h chiều mỗi ngày

cron.schedule("7 17,23 * * *", async () => {
  console.log("⏰ Cron job: auto notify expiring foods");
  try {
    await notifyController.autoNotifyExpiringFoods(
      { body: {} }, // fake req
      { 
        json: (data) => console.log("✅ Auto notify result:", data),
        status: (code) => ({ json: (data) => console.log(`❌ Error ${code}:`, data) })
      }
    );
  } catch (err) {
    console.error("❌ Cron job error:", err.message);
  }
});


const connectDB = require("./config/db.js"); 

const foodRoutes = require("./routes/foodRoutes.js");
const authRoutes = require("./routes/authRoutes.js");
const userRoutes = require("./routes/userRoutes.js");
const recipeRoutes = require("./routes/recipesRoutes.js"); 
const cartRoutes = require("./routes/cartRoutes.js");
const notificationRoutes = require("./routes/notificationRoutes.js");
const app = express();
const bodyParser = require("body-parser");
const fcmRoutes = require("./routes/fcmRoutes");

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
app.use("/api/cart", cartRoutes);
app.use("/api/notify", notificationRoutes);

// FCM routes
app.use("/api/fcm", fcmRoutes);

const PORT = 5000;
app.listen(PORT, () => console.log(`Server chạy tại http://localhost:${PORT}`));
