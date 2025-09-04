const mongoose = require("mongoose");

const recipeSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  }, // Tên món ăn
  
  ingredients: [
    {
      name: { type: String, required: true },     // tên nguyên liệu
      quantity: { type: String, required: true }, // số lượng
    },
  ],
  
  instructions: [
    { type: String, required: true } // từng bước hướng dẫn nấu ăn
  ],

  category: { type: String }, // ví dụ: Thịt, Rau, Tráng miệng...

  location: { type: String, default: null }, // vị trí (ví dụ: Nhà bếp)

  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: false 
  }, // gắn với người dùng nào

  createdAt: { 
    type: Date, 
    default: Date.now 
  },
});

module.exports = mongoose.model("Recipe", recipeSchema);
