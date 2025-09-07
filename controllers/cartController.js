const User = require("../models/userModel");

// Lấy giỏ hàng

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

// Thêm food vào giỏ hàng 

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
      user.cart.push({ foodName });  
      await user.save();
    }

    res.json(user.cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Xóa 1 món ăn khỏi giỏ
exports.deleteMultiple = async (req, res) => {
  try {
    const { userId } = req.params;
    const { itemIds } = req.body; 

    if (!itemIds || !Array.isArray(itemIds)) {
      return res.status(400).json({ message: "itemIds phải là mảng" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "Không tìm thấy user" });

    user.cart = user.cart.filter(
      (item) => !itemIds.includes(item._id.toString())
    );

    await user.save();
    res.json(user.cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Xóa toàn bộ giỏ hàng
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

// Cập nhật trạng thái đã mua/chưa mua của món ăn trong giỏ
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

