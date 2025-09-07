const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");

// Lấy giỏ hàng theo user
router.get("/:userId", cartController.getCart);

// Thêm món ăn vào giỏ 
router.post("/:userId/add", cartController.addToCart);

// Xóa 1 món ăn khỏi giỏ
router.post("/:userId/delete-multiple", cartController.deleteMultiple);

// Xóa toàn bộ giỏ hàng
router.delete("/:userId/clear", cartController.clearCart);

// Cập nhật trạng thái đã mua/chưa mua của món ăn trong giỏ
router.put("/:userId/update/:itemId", cartController.toggleCartItem);

module.exports = router;
