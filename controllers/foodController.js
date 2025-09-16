const Food = require('../models/foodModel');

// Lấy tất cả foods
exports.getAllFoods = async (req, res) => {
  try {
    const foods = await Food.find().sort({ registerDate: -1 });
    res.json(foods);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Thêm food mới
exports.addFood = async (req, res) => {
  try {
    const newFood = new Food(req.body);
    await newFood.save();
    res.status(201).json(newFood);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy tất cả foods của 1 user
exports.getFoodsByUser = async (req, res) => {
  try {
    const { userId } = req.query; 

    if (!userId) {
      return res.status(400).json({ message: "userId query parameter is required" });
    }

    const foods = await Food.find({ userId });
    res.json(foods);
  } catch (err) {
    res.status(500).json({ message: err.message });
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

