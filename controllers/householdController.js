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

// ✅ Lấy danh sách tất cả hộ gia đình
exports.getAllHouseholds = async (req, res) => {
  try {
    const households = await Household.find(); 

    res.status(200).json({
      message: "Lấy danh sách hộ gia đình thành công!",
      households,
    });
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách hộ:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// ✅ Lấy danh sách hộ gia đình theo userId (chỉ household)
exports.getHouseholdsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    const households = await Household.find({
      $or: [
        { ownerId: userId },
        { "members.userId": userId },
      ],
    }); 

    res.status(200).json({
      message: "Lấy danh sách hộ gia đình theo người dùng thành công!",
      households,
    });
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách hộ:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};


// ✅ Xóa thành viên trong hộ (chỉ chủ hộ)
exports.removeMember = async (req, res) => {
  try {
    const { householdId } = req.params;
    const { memberId, userId } = req.body; 
    // userId = người đang yêu cầu (được lấy từ middleware hoặc frontend gửi lên)
    // memberId = ID của thành viên bị xóa

    // 1️⃣ Kiểm tra hộ tồn tại
    const household = await Household.findById(householdId);
    if (!household) {
      return res.status(404).json({ message: "Hộ gia đình không tồn tại." });
    }

    // 2️⃣ Kiểm tra người yêu cầu có phải chủ hộ không
    if (household.ownerId.toString() !== userId) {
      return res.status(403).json({ message: "Chỉ chủ hộ mới có quyền xóa thành viên." });
    }

    // 3️⃣ Kiểm tra xem thành viên có trong hộ không
    const isMember = household.members.some(
      (m) => m.userId.toString() === memberId
    );

    if (!isMember) {
      return res.status(404).json({ message: "Thành viên không tồn tại trong hộ." });
    }

    // 4️⃣ Loại bỏ thành viên khỏi danh sách
    household.members = household.members.filter(
      (m) => m.userId.toString() !== memberId
    );

    // 5️⃣ Lưu thay đổi vào DB
    await household.save();

    // 6️⃣ Cập nhật user bị xóa
    const removedUser = await User.findById(memberId);
    if (removedUser) {
      removedUser.householdId = null;
      removedUser.householdRole = null;
      await removedUser.save();
    }

    // 7️⃣ Ghi log hoạt động
    household.activityLogs.push({
      action: "remove_member",
      userId: userId,
      message: `Chủ hộ đã xóa thành viên ${removedUser?.name || memberId} khỏi hộ.`,
      createdAt: new Date(),
    });
    await household.save();

    return res.status(200).json({
      message: "Đã xóa thành viên khỏi hộ gia đình thành công.",
      household,
    });
  } catch (error) {
    console.error("❌ Lỗi khi xóa thành viên:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};



