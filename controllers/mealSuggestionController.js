// controllers/mealSuggestionController.js
const Food = require("../models/foodModel");
const Recipe = require("../models/recipeModel");

// Gợi ý món ăn hôm nay dựa trên thực phẩm người dùng có (ít nhất 2 nguyên liệu)
exports.getTodayMealSuggestions = async (req, res) => {
  try {
    const userId = req.params.userId;

    // 1. Lấy toàn bộ thực phẩm của user
    const userFoods = await Food.find({ userId });
    const foodNames = userFoods.map(f => f.name.toLowerCase());

    // 2. Lấy tất cả công thức
    const recipes = await Recipe.find();

    // 3. Lọc các món có ít nhất 2 nguyên liệu có trong danh sách của user
    const suggestions = recipes.filter(recipe => {
      const recipeIngredients = recipe.ingredients.map(i => i.name.toLowerCase());
      const matchedCount = recipeIngredients.filter(i => foodNames.includes(i)).length;
      return matchedCount >= 4; // ít nhất 4 nguyên liệu
    });

    res.json({ suggestions }); // trả về toàn bộ thông tin món
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// -------------------- Lấy tất cả món theo category --------------------
exports.getRecipesByCategory = async (req, res) => {
  try {
    const category = req.params.category;

    // 1. Lấy tất cả công thức
    const recipes = await Recipe.find({ category: category });

    // 2. Trả về danh sách
    res.json({ recipes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// -------------------- Lấy tất cả món ăn --------------------
exports.getAllRecipes = async (req, res) => {
  try {
    // Lấy toàn bộ công thức từ DB
    const recipes = await Recipe.find();

    // Trả về danh sách
    res.json({ recipes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// -------------------- Lấy tất cả category --------------------
exports.getAllCategories = async (req, res) => {
  try {
    // Dùng distinct để lấy ra các category duy nhất
    const categories = await Recipe.distinct("category");

    res.json({ categories });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

