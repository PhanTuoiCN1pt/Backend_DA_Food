const Household = require("../models/householdModel");
const User = require("../models/userModel");
const { v4: uuidv4 } = require("uuid");

// ✅ Tạo hộ gia đình mới
exports.createHousehold = async (req, res) => {
    try {
        const { name, description, imageUrl } = req.body;
        const userId = req.user?._id || req.body.userId; // lấy từ middleware hoặc body (tùy bạn thiết kế)

        // Kiểm tra user hợp lệ
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "Người dùng không tồn tại." });
        }

        // Kiểm tra xem user đã thuộc hộ gia đình nào chưa
        if (user.householdId) {
            return res.status(400).json({ message: "Người dùng đã thuộc một hộ gia đình khác." });
        }

        // Tạo mã mời duy nhất
        const inviteCode = uuidv4().slice(0, 8).toUpperCase(); // ví dụ: "A1B2C3D4"

        // Tạo hộ gia đình
        const household = new Household({
            name,
            ownerId: user._id,
            inviteCode,
            description: description || "",
            imageUrl: imageUrl || "",
            members: [
                {
                    userId: user._id,
                    role: "owner",
                    joinedAt: new Date(),
                },
            ],
            activityLogs: [
                {
                    action: "create_household",
                    userId: user._id,
                    message: `${user.name || "Người dùng"} đã tạo hộ gia đình mới.`,
                },
            ],
        });

        await household.save();

        // Cập nhật user thành chủ hộ
        user.householdId = household._id;
        user.householdRole = "owner";
        await user.save();

        return res.status(201).json({
            message: "Tạo hộ gia đình thành công!",
            household,
        });
    } catch (error) {
        console.error("❌ Lỗi khi tạo hộ gia đình:", error);
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};

// ✅ Tham gia hộ bằng mã mời
exports.joinByInvite = async (req, res) => {
  try {
    const { inviteCode, userId } = req.body;

    // 1️⃣ Tìm hộ theo mã mời
    const household = await Household.findOne({ inviteCode });
    if (!household) {
      return res.status(404).json({ message: "Mã mời không hợp lệ." });
    }

    // 2️⃣ Kiểm tra người dùng hợp lệ
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại." });
    }

    // 3️⃣ Kiểm tra xem user đã trong hộ chưa
    const alreadyInHousehold = household.members.some(
      (m) => m.userId.toString() === userId
    );
    if (alreadyInHousehold) {
      return res.status(400).json({ message: "Người dùng đã trong hộ." });
    }

    // 4️⃣ Thêm vào danh sách members
    household.members.push({
      userId: user._id,
      role: "member",
      joinedAt: new Date(),
    });

    // 5️⃣ Lưu thay đổi
    await household.save();

    // 6️⃣ Cập nhật user
    user.householdId = household._id;
    user.householdRole = "member";
    await user.save();

    res.status(200).json({
      message: "Tham gia hộ thành công.",
      household,
    });
  } catch (error) {
    console.error("❌ Lỗi khi tham gia hộ:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};
