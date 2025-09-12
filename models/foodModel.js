const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema({
  id: { type: String, required: true }, 
  userId: { type: String, required: true },
  category: { type: String, required: true },
  name: { type: String, required: true },
  quantity: { type: Number, default: 1 },
  location: { type: String, default: "Tủ lạnh" },
  registerDate: { type: Date, default: Date.now },
  expiryDate: { type: Date },
  note: { type: String, default: "" },
});

module.exports = mongoose.model("Food", foodSchema);
