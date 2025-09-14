const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");

// Lấy tất cả category
router.get("/", categoryController.getCategories);

// Lấy 1 category theo id
router.get("/:id", categoryController.getCategoryById);

module.exports = router;
