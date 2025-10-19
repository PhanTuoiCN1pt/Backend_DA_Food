const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController.js");

// Lấy tất cả category
router.get("/", categoryController.getCategories);

// Tìm món ăn theo subCategory
router.get("/searchBySubCategory", categoryController.searchFoodBySubCategory);

// Lấy 1 category theo id (đặt sau cùng)
router.get("/:id", categoryController.getCategoryById);

router.get("/:id/subCategories", categoryController.getSubCategories);

// CRUD subCategories
router.post("/:id/subcategories", categoryController.addSubCategory);
router.put("/:id/subcategories/:subId", categoryController.updateSubCategory);
router.delete("/:id/subcategories/:subId", categoryController.deleteSubCategory);

module.exports = router;
