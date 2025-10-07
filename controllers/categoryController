const Category = require("../models/categoryModel");

// 🔹 Lấy tất cả category
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({});
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error });
  }
};

// 🔹 Lấy 1 category kèm subCategories (lọc theo owner)
exports.getCategoryById = async (req, res) => {
  try {
    const { userId } = req.query;
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: "Không tìm thấy category" });

    // Lọc sub theo quyền
    const visibleSubs = category.subCategories.filter(
      (sub) => sub.ownerId === "admin" || sub.ownerId === userId
    );

    res.json({
      ...category.toObject(),
      subCategories: visibleSubs,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error });
  }
};

// 🔹 Lấy danh sách subCategories theo userId (admin + user)
exports.getSubCategories = async (req, res) => {
  try {
    const { id } = req.params; // categoryId
    const { ownerId } = req.query;

    const category = await Category.findById(id).select("subCategories");
    if (!category) {
      return res.status(404).json({ message: "Category không tồn tại" });
    }

    const filtered = category.subCategories.filter(
      (sub) => sub.ownerId === "admin" || sub.ownerId === ownerId
    );

    res.json(filtered);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error });
  }
};

// 🔹 Thêm subCategory mới (gắn ownerId)
exports.addSubCategory = async (req, res) => {
  try {
    const { id } = req.params; // id của Category
    const { label, icon, ownerId } = req.body; // ✅ đổi userId thành ownerId

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category không tồn tại" });
    }

    category.subCategories.push({
      label,
      icon,
      ownerId: ownerId || "admin", // ✅ đúng trường
    });

    await category.save();
    res.status(201).json({ message: "Thêm subCategory thành công", category });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error });
  }
};


// 🔹 Cập nhật subCategory (chỉ owner mới được cập nhật)
exports.updateSubCategory = async (req, res) => {
  try {
    const { id, subId } = req.params;
    const { label, icon, userId } = req.body;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category không tồn tại" });
    }

    const subCategory = category.subCategories.id(subId);
    if (!subCategory) {
      return res.status(404).json({ message: "SubCategory không tồn tại" });
    }

    // 🔒 Kiểm tra quyền sở hữu
    if (subCategory.ownerId !== userId) {
      return res.status(403).json({ message: "Không có quyền chỉnh sửa thực phẩm này" });
    }

    if (label) subCategory.label = label;
    if (icon) subCategory.icon = icon;

    await category.save();
    res.json({ message: "Cập nhật thành công", subCategory });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error });
  }
};

// 🔹 Xóa subCategory (chỉ owner mới được xóa)
exports.deleteSubCategory = async (req, res) => {
  try {
    const { id, subId } = req.params;
    const { userId } = req.query;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category không tồn tại" });
    }

    const subCategory = category.subCategories.id(subId);
    if (!subCategory) {
      return res.status(404).json({ message: "SubCategory không tồn tại" });
    }

    // 🔒 Chỉ owner mới được phép xóa
    if (subCategory.ownerId !== userId) {
      return res.status(403).json({ message: "Không có quyền xóa thực phẩm này" });
    }

    subCategory.deleteOne();
    await category.save();

    res.json({ message: "Xóa subCategory thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error });
  }
};

// 🔹 Tìm food theo từ khóa, lọc theo quyền (admin + user)
exports.searchFoodBySubCategory = async (req, res) => {
  try {
    const { keyword, userId } = req.query;

    if (!keyword) {
      return res.status(400).json({ message: "Thiếu keyword để tìm kiếm" });
    }

    const categories = await Category.find({
      "subCategories.label": { $regex: keyword, $options: "i" },
    });

    if (!categories.length) {
      return res.status(404).json({ message: "Không tìm thấy thực phẩm" });
    }

    const results = [];
    categories.forEach((cat) => {
      cat.subCategories.forEach((sub) => {
        if (
          sub.label.toLowerCase().includes(keyword.toLowerCase()) &&
          (sub.ownerId === "admin" || sub.ownerId === userId)
        ) {
          results.push({
            category: cat.label,
            ...sub.toObject(),
          });
        }
      });
    });

    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
