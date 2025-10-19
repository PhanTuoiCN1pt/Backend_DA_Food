const Food = require("../models/foodModel");
const { Recipe } = require("../models/recipeModel");
const RecipeUser = require("../models/recipeUser");
const User = require("../models/userModel");

// -------------------- GỢI Ý MÓN ĂN --------------------
exports.getTodayMealSuggestions = async (req, res) => {
  try {
    const userId = req.params.userId;
    const userFoods = await Food.find({ userId });
    const foodNames = userFoods.map(f => f.name.toLowerCase());

    // Lấy tất cả recipe của admin hoặc người dùng này
    const recipes = await Recipe.find({
      $or: [{ ownerId: null }, { ownerId: userId }]
    });

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

// ✅ Lấy công thức (gồm công thức admin + của người dùng đang đăng nhập)
exports.getRecipes = async (req, res) => {
  try {
    const { ownerId } = req.query;

    // Nếu có ownerId thì lấy: (ownerId == userId hoặc ownerId == "admin" hoặc ownerId chưa có)
    let query = {};
    if (ownerId) {
      query = {
        $or: [
          { ownerId: ownerId },    // của user hiện tại
          { ownerId: "admin" },    // của admin
          { ownerId: { $exists: false } } // các món cũ chưa có ownerId => mặc định admin
        ]
      };
    }
    const recipes = await Recipe.find(query);
    res.json(recipes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Lấy công thức theo category (chỉ admin + user hiện tại)
exports.getRecipesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { ownerId } = req.query; // string, optional

    // Nếu ownerId được truyền, thêm vào điều kiện $or
    const orConditions = [
      { ownerId: null },    // món chung
      { ownerId: "admin" }  // món admin
    ];

    if (ownerId) {
      orConditions.push({ ownerId: ownerId }); // string ownerId
    }

    const recipes = await Recipe.find({
      category,
      $or: orConditions,
    });

    res.json({ recipes });
  } catch (err) {
    console.error(err);
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
    const { userId } = req.query;

    if (!location) {
      return res.status(400).json({ message: "Thiếu location" });
    }

    const query = userId
      ? { location, $or: [{ ownerId: null }, { ownerId: userId }] }
      : { location };

    const recipes = await Recipe.find(query);
    res.json(recipes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// -------------------- NHÀ BẾP (RECIPE USER) --------------------
exports.addToKitchen = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) return res.status(400).json({ message: "Thiếu userId" });

    const recipe = await Recipe.findById(id);
    if (!recipe) return res.status(404).json({ message: "Không tìm thấy công thức" });

    const user = await User.findById(userId);
    const existing = await RecipeUser.findOne({
      name: recipe.name,
      userId,
      location: "Nhà bếp",
    });

    if (existing) return res.status(400).json({ message: "Món đã có trong nhà bếp" });

    const newRecipe = new RecipeUser({
      name: recipe.name,
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
      category: recipe.category,
      location: "Nhà bếp",
      image: recipe.image || "",
      userId: user._id,
    });

    await newRecipe.save();
    res.status(201).json({ message: "Đã thêm vào nhà bếp", recipe: newRecipe });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getKitchenRecipes = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ message: "Thiếu userId" });

    const recipes = await RecipeUser.find({ userId, location: "Nhà bếp" });
    res.json(recipes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.removeFromKitchen = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await RecipeUser.findByIdAndDelete(id);
    if (!deleted)
      return res.status(404).json({ message: "Không tìm thấy recipe trong Nhà bếp" });

    res.json({ message: "Xóa recipe khỏi Nhà bếp thành công", recipe: deleted });
  } catch (err) {
    console.error("Lỗi xóa recipe khỏi kitchen:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// -------------------- ADMIN CRUD --------------------
exports.adminGetCountAllRecipes = async (req, res) => {
  try {
    const count = await Recipe.countDocuments();
    res.json({ totalRecipes: count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.adminGetAllRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.find();
    res.json({ recipes });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.adminGetRecipeById = async (req, res) => {
  try {
    const { id } = req.params;
    const recipe = await Recipe.findById(id);
    if (!recipe)
      return res.status(404).json({ message: "Không tìm thấy công thức" });
    res.json(recipe);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Tạo công thức mới (có ownerId)
exports.adminCreateRecipe = async (req, res) => {
  try {
    const { name, ingredients, instructions, category, subCategory, location, image, ownerId } =
      req.body;

    if (!name || !ingredients || !instructions || !category) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
    }

    const newRecipe = new Recipe({
      name,
      ingredients,
      instructions,
      category,
      subCategory: subCategory || "",
      location: location || "",
      image: image || "",
      ownerId: ownerId || "admin",
    });

    await newRecipe.save();
    res.status(201).json(newRecipe);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.adminUpdateRecipe = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Recipe.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated)
      return res.status(404).json({ message: "Không tìm thấy công thức" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.adminDeleteRecipe = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Recipe.findByIdAndDelete(id);
    if (!deleted)
      return res.status(404).json({ message: "Không tìm thấy công thức" });
    res.json({ message: "Xóa công thức thành công", recipe: deleted });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
