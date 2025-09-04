const express = require("express");
const router = express.Router();
const recipeController = require("../controllers/recipeController");

// @desc Lấy toàn bộ công thức
router.get("/", recipeController.getRecipes);

// @desc Tạo công thức mới 
router.post("/", recipeController.createRecipe);

// Nhà bếp của user
router.put("/kitchen/:id", recipeController.addToKitchen);
router.get("/kitchen", recipeController.getKitchenRecipes);

// Xóa recipe khỏi Nhà bếp của user (theo id trong RecipeUser)
router.delete("/kitchen/delete/:id", recipeController.removeFromKitchen);

// lấy recipes theo location 
router.get("/location/:location", recipeController.getRecipesByLocation);

module.exports = router;
