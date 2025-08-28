const express = require("express");
const router = express.Router();
const foodController = require("../controllers/foodController");

// Thêm food mới
router.post("/", foodController.addFood);

// Lấy tất cả foods của 1 user (Flutter gửi userId)
router.get("/", foodController.getFoodsByUser);

// Cập nhật food theo id
router.put("/:id", foodController.updateFood);

// Xóa food theo id
router.delete("/:id", foodController.deleteFood);

module.exports = router;
