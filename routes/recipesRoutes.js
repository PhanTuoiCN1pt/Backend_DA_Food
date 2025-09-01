const express = require("express");
const router = express.Router();
const recipeController = require("../controllers/recipeController");

// @desc Lấy toàn bộ công thức
router.get("/", recipeController.getRecipes);

// @desc Tạo công thức mới
router.post("/", recipeController.createRecipe);

module.exports = router;
