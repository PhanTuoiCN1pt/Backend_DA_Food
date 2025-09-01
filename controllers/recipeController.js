const Recipe = require("../models/recipeModel");

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
