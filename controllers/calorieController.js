const { calculateCalories } = require("../calorieService");

exports.getCalories = async (req, res) => {
  try {
    const { name, ingredients } = req.body; // từ client gửi lên
    const result = await calculateCalories(name, ingredients);
    if (!result) {
      return res.status(400).json({ message: "Không tính được calo" });
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
