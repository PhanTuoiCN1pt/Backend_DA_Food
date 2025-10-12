const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
  foodName: { type: String, required: true },
  done: { type: Boolean, default: false },
});

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, required: true, unique: true },
    password: String,

    // 🔗 Thêm liên kết đến household
    householdId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Household",
      default: null,
    },

    // Vai trò của user trong hộ (để truy vấn nhanh, tránh phải populate)
    householdRole: {
      type: String,
      enum: ["owner", "admin", "member", null],
      default: null,
    },

    resetPasswordOtp: String,
    resetPasswordExpires: Date,
    fcmToken: { type: String, default: null },
    lastLogin: { type: Date, default: null },
    notifyTime: { type: String, default: "08:00" },
    cart: {
      type: [cartItemSchema],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
