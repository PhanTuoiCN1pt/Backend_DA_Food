// models/categoryModel.js
const mongoose = require("mongoose");

const subCategorySchema = new mongoose.Schema({
  icon: String,
  label: String,
});

const categorySchema = new mongoose.Schema({
  icon: String,
  label: String,
  subCategories: [subCategorySchema],
});

module.exports = mongoose.model("Category", categorySchema);
