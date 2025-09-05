// models/userModel.js
const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
  foodName: { type: String, required: true },
});

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, required: true, unique: true },
    password: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    fcmToken: { type: String, default: null },
    cart: {
      type: [cartItemSchema],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
