const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");

// Lấy tất cả category
router.get("/", categoryController.getCategories);

// 🔍 Route đặc biệt phải đặt trước
router.get("/searchBySubCategory", categoryController.searchFoodBySubCategory);

// Lấy 1 category theo id (đặt sau cùng)
router.get("/:id", categoryController.getCategoryById);

// CRUD subCategories
router.post("/:id/subcategories", categoryController.addSubCategory);
router.put("/:id/subcategories/:subId", categoryController.updateSubCategory);
router.delete("/:id/subcategories/:subId", categoryController.deleteSubCategory);

module.exports = router;
