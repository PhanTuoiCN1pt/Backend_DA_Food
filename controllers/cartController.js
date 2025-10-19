const User = require("../models/userModel");

// ✅ Lấy giỏ hàng
exports.getCart = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ message: "Không tìm thấy người dùng." });

    res.json({
      message: "Lấy giỏ hàng thành công!",
      cart: user.cart,
    });
  } catch (err) {
    res.status(500).json({ message: "Đã xảy ra lỗi khi lấy giỏ hàng." });
  }
};

// ✅ Thêm món ăn vào giỏ hàng
exports.addToCart = async (req, res) => {
  try {
    const { userId } = req.params;
    const { foodName } = req.body;

    if (!foodName) {
      return res.status(400).json({ message: "Tên món ăn là bắt buộc." });
    }

    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ message: "Không tìm thấy người dùng." });

    // Kiểm tra trùng món ăn
    const exists = user.cart.find((item) => item.foodName === foodName);
    if (exists) {
      return res
        .status(400)
        .json({ message: "Món ăn này đã có trong giỏ hàng." });
    }

    user.cart.push({ foodName });
    await user.save();

    res.json({
      message: "Đã thêm món ăn vào giỏ hàng thành công!",
      cart: user.cart,
    });
  } catch (err) {
    res.status(500).json({ message: "Đã xảy ra lỗi khi thêm vào giỏ hàng." });
  }
};

// ✅ Xóa nhiều món ăn khỏi giỏ hàng
exports.deleteMultiple = async (req, res) => {
  try {
    const { userId } = req.params;
    const { itemIds } = req.body;

    if (!itemIds || !Array.isArray(itemIds)) {
      return res
        .status(400)
        .json({ message: "Danh sách itemIds phải là một mảng hợp lệ." });
    }

    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ message: "Không tìm thấy người dùng." });

    const beforeCount = user.cart.length;

    user.cart = user.cart.filter(
      (item) => !itemIds.includes(item._id.toString())
    );

    const removedCount = beforeCount - user.cart.length;

    await user.save();

    res.json({
      message: `Đã xóa ${removedCount} món ăn khỏi giỏ hàng.`,
      cart: user.cart,
    });
  } catch (err) {
    res.status(500).json({ message: "Đã xảy ra lỗi khi xóa món ăn." });
  }
};

// ✅ Xóa toàn bộ giỏ hàng
exports.clearCart = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ message: "Không tìm thấy người dùng." });

    user.cart = [];
    await user.save();

    res.json({ message: "Đã xóa toàn bộ giỏ hàng thành công!" });
  } catch (err) {
    res.status(500).json({ message: "Đã xảy ra lỗi khi xóa giỏ hàng." });
  }
};

// ✅ Cập nhật trạng thái đã mua/chưa mua của món ăn
exports.toggleCartItem = async (req, res) => {
  try {
    const { userId, itemId } = req.params;

    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ message: "Không tìm thấy người dùng." });

    const item = user.cart.id(itemId);
    if (!item)
      return res.status(404).json({ message: "Không tìm thấy món ăn trong giỏ hàng." });

    item.done = !item.done;
    await user.save();

    res.json({
      message: `Đã cập nhật trạng thái món ăn thành "${
        item.done ? "Đã mua" : "Chưa mua"
      }".`,
      cart: user.cart,
    });
  } catch (err) {
    res.status(500).json({ message: "Đã xảy ra lỗi khi cập nhật trạng thái món ăn." });
  }
};
