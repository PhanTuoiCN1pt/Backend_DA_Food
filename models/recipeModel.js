// const mongoose = require("mongoose");

// const recipeSchema = new mongoose.Schema({
//   name: { 
//     type: String, 
//     required: true 
//   }, 
  
//   ingredients: [
//     {
//       name: { type: String, required: true },     
//       quantity: { type: String, required: true }, 
//     },
//   ],
  
//   instructions: [
//     { type: String, required: true } 
//   ],

//   category: { type: String }, 

//   location: { type: String, default: null }, 

//   userId: { 
//     type: mongoose.Schema.Types.ObjectId, 
//     ref: "User", 
//     required: false 
//   }, 

//   createdAt: { 
//     type: Date, 
//     default: Date.now 
//   },

//   image: { type: String, rerequired: false},
  
// });

// module.exports = mongoose.model("Recipe", recipeSchema);


const mongoose = require("mongoose");

// Schema cho Recipe
const recipeSchema = new mongoose.Schema({
  name: { type: String, required: true },

  ingredients: [
    {
      name: { type: String, required: true },
      quantity: { type: String, required: true },
    },
  ],

  instructions: [{ type: String, required: true }],

  // Lưu trực tiếp tên category cha & con
  category: { type: String, required: true }, // ví dụ: "Thịt"
  subCategory: { type: String, required: true }, // ví dụ: "Chiên"

  location: { type: String, default: null },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  image: { type: String, required: false },
});

const Recipe = mongoose.model("Recipe", recipeSchema);

module.exports = { Recipe };

