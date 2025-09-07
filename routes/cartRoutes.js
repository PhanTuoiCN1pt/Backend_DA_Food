// routes/cartRoutes.js
const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");

// Lấy giỏ hàng theo user
router.get("/:userId", cartController.getCart);

// Thêm món ăn vào giỏ (chỉ name)
router.post("/:userId/add", cartController.addToCart);

// Xóa 1 món ăn khỏi giỏ theo name
router.delete("/:userId/remove/:foodName", cartController.removeFromCart);

// Xóa toàn bộ giỏ hàng
router.delete("/:userId/clear", cartController.clearCart);

router.put("/:userId/update/:itemId", cartController.toggleCartItem);

module.exports = router;
