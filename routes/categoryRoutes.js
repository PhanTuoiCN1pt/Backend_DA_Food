const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");

// Lấy tất cả category
router.get("/", categoryController.getCategories);

// Lấy 1 category theo id
router.get("/:id", categoryController.getCategoryById);

router.post("/:id/subcategories", categoryController.addSubCategory);
router.put("/:id/subcategories/:subId", categoryController.updateSubCategory);
router.delete("/:id/subcategories/:subId", categoryController.deleteSubCategory);

module.exports = router;
