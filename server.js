const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db.js"); 

const foodRoutes = require("./routes/foodRoutes.js");
const authRoutes = require("./routes/authRoutes.js");
const userRoutes = require("./routes/userRoutes.js");
const recipeRoutes = require("./routes/recipesRoutes.js"); 
const cartRoutes = require("./routes/cartRoutes.js");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// -------------------- Connect DB --------------------
connectDB();

// -------------------- Routes --------------------
app.use("/api/foods", foodRoutes);
app.use("/api/auths", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/recipes", recipeRoutes); 
app.use("/api/cart", cartRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server đang chạy trên cổng ${PORT}`));
