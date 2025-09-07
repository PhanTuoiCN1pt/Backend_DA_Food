const User = require("../models/userModel");

// @desc Lấy giỏ hàng
// @route GET /api/cart/:userId
exports.getCart = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user.cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Thêm food vào giỏ hàng (chỉ lưu tên)
// @route POST /api/cart/:userId/add
// body: { foodName: "Bít tết" }
exports.addToCart = async (req, res) => {
  try {
    const { userId } = req.params;
    const { foodName } = req.body;

    if (!foodName) {
      return res.status(400).json({ message: "foodName is required" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Không thêm trùng
    const exists = user.cart.find(item => item.foodName === foodName);
    if (!exists) {
      user.cart.push({ foodName });  // <-- đảm bảo đúng key
      await user.save();
    }

    res.json(user.cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Xóa food khỏi giỏ
// @route DELETE /api/cart/:userId/remove/:name
exports.removeFromCart = async (req, res) => {
  try {
    const { userId, name } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.cart = user.cart.filter(item => item.name !== name);
    await user.save();

    res.json(user.cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Xóa toàn bộ giỏ hàng
// @route DELETE /api/cart/:userId/clear
exports.clearCart = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.cart = [];
    await user.save();

    res.json({ message: "Cart cleared" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/users/:userId/cart/:itemId/toggle
exports.toggleCartItem = async (req, res) => {
  const { userId, itemId } = req.params;

  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: "User not found" });

  const item = user.cart.id(itemId);
  if (!item) return res.status(404).json({ message: "Item not found" });

  item.done = !item.done;
  await user.save();

  res.json(user.cart);
};

