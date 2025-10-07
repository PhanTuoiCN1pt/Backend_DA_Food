// models/categoryModel.js
const mongoose = require("mongoose");

// 🔹 Schema cho từng subCategory (thực phẩm con)
const subCategorySchema = new mongoose.Schema({
  icon: { type: String, required: true },
  label: { type: String, required: true },
  ownerId: {
    type: String,
    required: true,
    default: "admin", // 🔹 Dữ liệu mặc định thuộc admin
  },
});

// 🔹 Schema cho Category (nhóm thực phẩm)
const categorySchema = new mongoose.Schema({
  icon: { type: String, required: true },
  label: { type: String, required: true },
  subCategories: [subCategorySchema],
});

module.exports = mongoose.model("Category", categorySchema);

