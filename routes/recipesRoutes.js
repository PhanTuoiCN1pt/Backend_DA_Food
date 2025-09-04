// routes/recipeRoutes.js
const express = require("express");
const router = express.Router();
const recipeController = require("../controllers/recipeController");

// -------------------- GỢI Ý MÓN ĂN --------------------
// GET /api/recipes/suggestions/:userId
router.get("/suggestions/:userId", recipeController.getTodayMealSuggestions);

// -------------------- CATEGORY & ALL --------------------
// GET /api/recipes/category/:category
router.get("/category/:category", recipeController.getRecipesByCategory);

// GET /api/recipes/all
router.get("/all", recipeController.getAllRecipes);

// GET /api/recipes/categories
router.get("/categories", recipeController.getAllCategories);

// -------------------- CRUD --------------------
// GET /api/recipes/
router.get("/", recipeController.getRecipes);

// POST /api/recipes/
router.post("/", recipeController.createRecipe);

// -------------------- NHÀ BẾP --------------------
// PUT /api/recipes/kitchen/:id  (thêm công thức vào kitchen)
router.put("/kitchen/:id", recipeController.addToKitchen);

// GET /api/recipes/kitchen?userId=xxx
router.get("/kitchen", recipeController.getKitchenRecipes);

// DELETE /api/recipes/kitchen/delete/:id
router.delete("/kitchen/delete/:id", recipeController.removeFromKitchen);

// -------------------- LOCATION --------------------
// GET /api/recipes/location/:location
router.get("/location/:location", recipeController.getRecipesByLocation);

module.exports = router;
