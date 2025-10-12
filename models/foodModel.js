const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema(
  {
    // Mã định danh nội bộ (nếu bạn dùng UUID riêng)
    id: { type: String, required: true },

    // Người thêm món ăn (có thể là thành viên trong hộ)
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // Nếu thực phẩm này thuộc tủ lạnh chung của hộ gia đình
    householdId: { type: mongoose.Schema.Types.ObjectId, ref: "Household", default: null },

    // Thông tin cơ bản
    category: { type: String, required: true },
    name: { type: String, required: true },
    quantity: { type: Number, default: 1 },
    unit: { type: String, default: "cái" }, // 👉 thêm đơn vị đo (g, ml, kg,...)
    location: { type: String, default: "Ngăn lạnh" },
    registerDate: { type: Date, default: Date.now },
    expiryDate: { type: Date },
    note: { type: String, default: "" },
    icon: { type: String, default: "" },

    // Theo dõi trạng thái
    status: {
      type: String,
      enum: ["available", "used", "expired", "shared"],
      default: "available",
    },

    // Lịch sử chỉnh sửa (ai đã thay đổi số lượng, xóa, v.v.)
    history: [
      {
        action: String, // "add", "update", "delete", "consume"
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        timestamp: { type: Date, default: Date.now },
        message: String,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Food", foodSchema);
