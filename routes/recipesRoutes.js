const express = require("express");
const router = express.Router();
const recipeController = require("../controllers/recipeController");

// -------------------- GỢI Ý MÓN ĂN --------------------
// Gợi ý món ăn hôm nay dựa trên thực phẩm người dùng có
router.get("/suggestions/:userId", recipeController.getTodayMealSuggestions);

// -------------------- CATEGORY & ALL --------------------
// Lấy công thức theo category
router.get("/category/:category", recipeController.getRecipesByCategory);

// Lấy tất cả danh mục
router.get("/categories", recipeController.getAllCategories);

// -------------------- CRUD --------------------
// Lấy tất cả công thức
router.get("/all", recipeController.getRecipes);

// -------------------- NHÀ BẾP --------------------
// Thêm công thức vào nhà bếp
router.put("/kitchen/:id", recipeController.addToKitchen);

// Lấy công thức trong nhà bếp
router.get("/kitchen", recipeController.getKitchenRecipes);

// Xóa công thức khỏi nhà bếp
router.delete("/kitchen/delete/:id", recipeController.removeFromKitchen);

// -------------------- LOCATION --------------------
// Lấy công thức theo location
router.get("/location/:location", recipeController.getRecipesByLocation);

// -------------------- CRUD CHO ADMIN ----------------


module.exports = router;
