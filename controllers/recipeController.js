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

// @desc Cập nhật recipe để thêm vào nhà bếp
exports.addToKitchen = async (req, res) => {
  try {
    const { id } = req.params; // lấy id từ URL
    const updatedRecipe = await Recipe.findByIdAndUpdate(
      id,
      { location: "Nhà bếp" },
      { new: true } // trả về bản ghi đã update
    );

    if (!updatedRecipe) {
      return res.status(404).json({ message: "Không tìm thấy công thức" });
    }

    res.json({ message: "Đã thêm vào nhà bếp", recipe: updatedRecipe });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// @desc Lấy danh sách công thức trong nhà bếp
exports.getKitchenRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.find({ location: "Nhà bếp" });
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