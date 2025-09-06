const mongoose = require("mongoose");

const recipeSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  }, 
  
  ingredients: [
    {
      name: { type: String, required: true },     
      quantity: { type: String, required: true }, 
    },
  ],
  
  instructions: [
    { type: String, required: true } 
  ],

  category: { type: String }, 

  location: { type: String, default: null }, 

  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: false 
  }, 

  createdAt: { 
    type: Date, 
    default: Date.now 
  },
});

module.exports = mongoose.model("Recipe", recipeSchema);
