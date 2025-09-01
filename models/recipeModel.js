const mongoose = require("mongoose");

const recipeSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  }, // Tên món ăn
  
  ingredients: [
    {
      name: { type: String, required: true },     // tên nguyên liệu
      quantity: { type: String, required: true }, // số lượng, ví dụ: "200g"
    },
  ],
  
  instructions: [
    { type: String, required: true } // từng bước hướng dẫn nấu ăn
  ],

  category: { 
    type: String 
  }, // ví dụ: Thịt, Rau, Tráng miệng...
  
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
});

module.exports = mongoose.model("Recipe", recipeSchema);
