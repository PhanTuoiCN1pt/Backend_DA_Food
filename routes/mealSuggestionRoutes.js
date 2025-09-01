// routes/mealSuggestionRoutes.js
const express = require("express");
const router = express.Router();
const { getTodayMealSuggestions } = require("../controllers/mealSuggestionController");

// GET /api/meals/suggestions/:userId
router.get("/suggestions/:userId", getTodayMealSuggestions);

module.exports = router;
