const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

const foodRoutes = require("./routes/foodRoutes.js");
const authRoutes = require("./routes/authRoutes.js");
const userRoutes = require("./routes/userRoutes.js");
const recipesRoutes = require("./routes/recipesRoutes.js");
const mealSuggestionRoutes = require("./routes/mealSuggestionRoutes.js");
const  getRecipesByCategory  = require("./controllers/mealSuggestionController.js");

const app = express();
app.use(bodyParser.json());

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 5000;

// Kết nối MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// Routes
app.use("/api/foods", foodRoutes);
app.use("/api/auths", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/recipes", recipesRoutes);
app.use("/api/meals", mealSuggestionRoutes);
app.get("/api/meals/category/:category", mealSuggestionRoutes);
app.get("/api/meals/all", mealSuggestionRoutes);
app.get("/api/meals/categories", mealSuggestionRoutes);

// Chạy server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
