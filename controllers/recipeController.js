// controllers/recipeController.js
const Food = require("../models/foodModel");
const { Recipe, Category } = require("../models/recipeModel"); 
const RecipeUser = require("../models/recipeUser");

// -------------------- GỢI Ý MÓN ĂN --------------------
// Gợi ý món ăn hôm nay dựa trên thực phẩm người dùng có
exports.getTodayMealSuggestions = async (req, res) => {
  try {
    const userId = req.params.userId;

    const userFoods = await Food.find({ userId });
    const foodNames = userFoods.map(f => f.name.toLowerCase());

    const recipes = await Recipe.find();

    const suggestions = recipes.filter(recipe => {
      const recipeIngredients = recipe.ingredients.map(i => i.name.toLowerCase());
      const matchedCount = recipeIngredients.filter(i => foodNames.includes(i)).length;
      return matchedCount >= 4;
    });

    res.json({ suggestions });
  } catch (err) {
    console.error("Lỗi getTodayMealSuggestions:", err);
    res.status(500).json({ message: err.message });
  }
};

// -------------------- LẤY DANH SÁCH CÔNG THỨC --------------------
exports.getRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.find();
    res.json(recipes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getRecipesByCategory = async (req, res) => {
  try {
    const category = req.params.category;
    const recipes = await Recipe.find({ category });
    res.json({ recipes });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Recipe.distinct("category");
    res.json({ categories });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getRecipesByLocation = async (req, res) => {
  try {
    const { location } = req.params;
    if (!location) {
      return res.status(400).json({ message: "Thiếu location" });
    }

    const recipes = await Recipe.find({ location });
    res.json(recipes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// -------------------- NHÀ BẾP (RECIPE USER) --------------------
// Thêm recipe vào nhà bếp 
exports.addToKitchen = async (req, res) => {
  try {
    const { id } = req.params; 
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "Thiếu userId" });
    }

    // Lấy recipe gốc
    const recipe = await Recipe.findById(id);
    if (!recipe) {
      return res.status(404).json({ message: "Không tìm thấy công thức" });
    }

    // Kiểm tra trùng tên món trong nhà bếp của user
    const existing = await RecipeUser.findOne({
      name: recipe.name,
      userId,
      location: "Nhà bếp",
    });

    if (existing) {
      return res.status(400).json({ message: "Món đã có trong nhà bếp" });
    }

    // Thêm recipe mới
    const newRecipe = new RecipeUser({
      name: recipe.name,
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
      category: recipe.category,
      location: "Nhà bếp",
      userId,
    });

    await newRecipe.save();
    res.status(201).json({ message: "Đã thêm vào nhà bếp", recipe: newRecipe });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// Lấy danh sách công thức trong nhà bếp của user
exports.getKitchenRecipes = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ message: "Thiếu userId" });
    }

    const recipes = await RecipeUser.find({ userId, location: "Nhà bếp" });
    res.json(recipes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Xóa recipe khỏi Nhà bếp
exports.removeFromKitchen = async (req, res) => {
  try {
    const { id } = req.params; 

    const deleted = await RecipeUser.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Không tìm thấy recipe trong Nhà bếp" });
    }

    res.json({
      message: "Xóa recipe khỏi Nhà bếp thành công",
      recipe: deleted,
    });
  } catch (err) {
    console.error("Lỗi xóa recipe khỏi kitchen:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// -------------------- ADMIN CRUD --------------------

// Lấy toàn bộ công thức
exports.adminGetAllRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.find();
    res.json({ recipes });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy chi tiết 1 công thức
exports.adminGetRecipeById = async (req, res) => {
  try {
    const { id } = req.params;
    const recipe = await Recipe.findById(id);
    if (!recipe) {
      return res.status(404).json({ message: "Không tìm thấy công thức" });
    }
    res.json(recipe);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Tạo công thức mới
exports.adminCreateRecipe = async (req, res) => {
  try {
    const { name, ingredients, instructions, category, subCategory, location, image } = req.body;

    // Kiểm tra thông tin bắt buộc
    if (!name || !ingredients || !instructions || !category || !subCategory) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
    }

    const newRecipe = new Recipe({
      name,
      ingredients,
      instructions,
      category,       // Lưu trực tiếp tên cha
      subCategory,    // Lưu trực tiếp tên con
      location: location || "",
      image: image || "",
    });

    await newRecipe.save();

    res.status(201).json(newRecipe);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


// Cập nhật công thức
exports.adminUpdateRecipe = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Recipe.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) {
      return res.status(404).json({ message: "Không tìm thấy công thức" });
    }
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Xóa công thức
exports.adminDeleteRecipe = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Recipe.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Không tìm thấy công thức" });
    }
    res.json({ message: "Xóa công thức thành công", recipe: deleted });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
