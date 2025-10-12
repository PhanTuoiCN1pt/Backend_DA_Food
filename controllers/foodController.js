const Food = require('../models/foodModel');
const Category = require("../models/categoryModel");
const User = require("../models/userModel");
// Lấy tất cả foods
exports.getFoodCount = async (req, res) => {
  try {
    const categories = await Category.find();
    const totalSubCategories = categories.reduce(
      (sum, cat) => sum + (cat.subCategories?.length || 0),
      0
    );
    res.json({ totalSubCategories, totalCategories: categories.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Thêm food mới
const { v4: uuidv4 } = require("uuid");

exports.addFood = async (req, res) => {
  try {
    // ✅ Lấy userId từ middleware, body hoặc query
    const userId = req.user?._id || req.body.userId || req.query.userId;

    if (!userId) {
      return res.status(400).json({ message: "userId query parameter is required" });
    }

    const {
      category,
      name,
      quantity,
      location,
      expiryDate,
      note,
      icon,
    } = req.body;

    // 🔍 Tìm user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại." });
    }

    // 🏠 Nếu user thuộc hộ → thêm householdId
    const foodData = {
      id: uuidv4(),
      userId: user._id,
      householdId: user.householdId || null,
      category,
      name,
      quantity: quantity || 1,
      location: location || "Ngăn lạnh",
      expiryDate,
      note,
      icon,
    };

    const newFood = new Food(foodData);
    await newFood.save();

    res.status(201).json({
      message: user.householdId
        ? "Đã thêm thực phẩm vào hộ gia đình!"
        : "Đã thêm thực phẩm cho người dùng!",
      food: newFood,
    });
  } catch (err) {
    console.error("❌ Lỗi khi thêm thực phẩm:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};


// 📦 Lấy thực phẩm theo hộ gia đình hoặc user
exports.getFoods = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: "Thiếu userId trên query parameter" });
    }

    // 🔍 Tìm người dùng
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

    let foods;

    // 🏠 Nếu user có hộ gia đình → lấy thực phẩm theo householdId
    if (user.householdId) {
      foods = await Food.find({ householdId: user.householdId });
    } else {
      // 👤 Nếu chưa có hộ → lấy thực phẩm của chính người đó
      foods = await Food.find({ userId: user._id });
    }

    return res.status(200).json({
      message: "Lấy danh sách thực phẩm thành công",
      count: foods.length,
      data: foods,
    });
  } catch (error) {
    console.error("❌ Lỗi khi lấy thực phẩm:", error);
    return res.status(500).json({
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// Cập nhật food
exports.updateFood = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedFood = await Food.findOneAndUpdate(
      { id },
      req.body,
      { new: true }
    );

    if (!updatedFood) {
      return res.status(404).json({ message: 'Food not found' });
    }

    res.json(updatedFood);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Xóa food
exports.deleteFood = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedFood = await Food.findOneAndDelete({ id });

    if (!deletedFood) {
      return res.status(404).json({ message: 'Food not found' });
    }

    res.json({ message: 'Food deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


//  Tìm kiếm food theo tên 
exports.searchFood = async (req, res) => {
  try {
    const { userId, keyword } = req.query;

    if (!userId) {
      return res.status(400).json({ message: "userId query parameter is required" });
    }

    const query = { userId };

    if (keyword && keyword.trim() !== "") {
      query.name = { $regex: keyword, $options: "i" };
      // Regex match gần đúng, không phân biệt hoa/thường
    }

    const foods = await Food.find(query).sort({ registerDate: -1 });
    res.json(foods);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};




