const express = require("express");
const router = express.Router();
const foodController = require("../controllers/foodController");

// Lấy tất cả foods (dành cho admin)
router.get('/all', foodController.getAllFoods);

// Thêm food mới
router.post("/", foodController.addFood);

// Lấy tất cả foods của user
router.get("/", foodController.getFoodsByUser);

// Cập nhật food theo id
router.put("/:id", foodController.updateFood);

// Tìm kiếm food theo tên
router.get("/search", foodController.searchFood);

// Xóa food theo id
router.delete("/:id", foodController.deleteFood);

module.exports = router;
