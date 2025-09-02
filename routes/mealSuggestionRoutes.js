// routes/mealSuggestionRoutes.js
const express = require("express");
const router = express.Router();
const { getTodayMealSuggestions, getRecipesByCategory, getAllRecipes, getAllCategories } = require("../controllers/mealSuggestionController");

// GET /api/meals/suggestions/:userId
router.get("/suggestions/:userId", getTodayMealSuggestions);

// GET tất cả món theo category
// Ví dụ: /api/meals/category/trang-mieng
router.get("/category/:category", getRecipesByCategory);

// GET /api/meals/all
router.get("/all", getAllRecipes);

// GET /api/meals/categories
router.get("/categories", getAllCategories);

module.exports = router;
