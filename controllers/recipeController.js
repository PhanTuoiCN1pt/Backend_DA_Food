const Recipe = require("../models/recipeModel");
const RecipeUser = require("../models/recipeUser");
// @desc Lấy toàn bộ công thức
exports.getRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.find();
    res.json(recipes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Tạo công thức mới
exports.createRecipe = async (req, res) => {
  try {
    const { name, ingredients, instructions, category } = req.body;

    if (!name || !ingredients || !instructions) {
      return res.status(400).json({ message: "Thiếu thông tin công thức" });
    }

    const newRecipe = new Recipe({
      name,
      ingredients,
      instructions,
      category,
    });

    await newRecipe.save();
    res.status(201).json(newRecipe);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc Thêm recipe vào nhà bếp (tạo document mới)
exports.addToKitchen = async (req, res) => {
  try {
    const { id } = req.params; // id của recipe gốc
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "Thiếu userId" });
    }

    // Lấy công thức gốc
    const recipe = await Recipe.findById(id);
    if (!recipe) {
      return res.status(404).json({ message: "Không tìm thấy công thức" });
    }

    // Tạo document mới trong RecipeUser
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


// @desc Lấy danh sách công thức trong nhà bếp của user
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


// @desc Lấy công thức theo location
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

// @desc Xóa recipe khỏi Nhà bếp (theo _id)
// @route DELETE /api/recipes/kitchen/delete/:id
exports.removeFromKitchen = async (req, res) => {
  try {
    const { id } = req.params; // _id của recipe trong collection recipeusers

    const deleted = await RecipeUser.findByIdAndDelete(id);

    if (!deleted) {
      return res
        .status(404)
        .json({ message: "❌ Không tìm thấy recipe trong Nhà bếp" });
    }

    res.json({
      message: "✅ Xóa recipe khỏi Nhà bếp thành công",
      recipe: deleted,
    });
  } catch (err) {
    console.error("❌ Lỗi xóa recipe khỏi kitchen:", err);
    res.status(500).json({ message: "Server error" });
  }
};



