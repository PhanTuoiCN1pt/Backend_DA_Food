const mongoose = require("mongoose");

const householdSchema = new mongoose.Schema({
    // Tên hộ gia đình
    name: { type: String, required: true },

    // Người tạo hộ (chủ hộ)
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // Danh sách thành viên
    members: [
        {
            userId: { type: String, required: true },
            role: {
                type: String,
                enum: ["owner", "admin", "member"],
                default: "member",
            },
            joinedAt: { type: Date, default: Date.now },
        },
    ],

    // Mã mời (để người khác nhập khi muốn tham gia)
    inviteCode: {
        type: String,
        unique: true,
        required: true,
    },

    // Quản lý thực phẩm hoặc tủ lạnh chung (nếu cần)
    sharedInventory: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Food",
        },
    ],

    // Tuỳ chọn quyền truy cập (mở rộng trong tương lai)
    settings: {
        allowGuests: { type: Boolean, default: false },
        autoShareInventory: { type: Boolean, default: true },
    },


    // Tùy chọn hiển thị
    description: { type: String, default: "" },
    imageUrl: { type: String, default: "" }, // Ảnh đại diện hộ gia đình (tuỳ chọn)

    // Nhật ký hoạt động (dành cho audit / thông báo)
    activityLogs: [
        {
            action: String, // "add_member", "remove_item", "update_inventory"
            userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            message: String,
            timestamp: { type: Date, default: Date.now },
        },
    ],

    // Thời gian tạo và cập nhật
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});


// Index để tìm nhanh theo mã mời hoặc chủ hộ
householdSchema.index({ inviteCode: 1 });
householdSchema.index({ ownerId: 1 });

// Middleware tự cập nhật `updatedAt` khi save
householdSchema.pre("save", function (next) {
    this.updatedAt = new Date();
    next();
});

module.exports = mongoose.model("Household", householdSchema);
