const mongoose = require("mongoose");

const recipeUserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  ingredients: [
    {
      name: { type: String, required: true },
      quantity: { type: String, required: true },
    },
  ],
  instructions: [{ type: String, required: true }],
  category: { type: String },
  location: { type: String, default: "Nhà bếp" }, 
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("RecipeUser", recipeUserSchema);
