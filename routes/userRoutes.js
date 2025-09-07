const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");


router.get("/", userController.getAllUsers);
router.get("/:id", userController.getUserById);
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);

router.post('/save-token', async (req, res) => {
  const { userId, fcmToken } = req.body;

  try {
    if (!userId || !fcmToken) {
      return res.status(400).json({ message: 'userId và fcmToken là bắt buộc' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { fcmToken },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy user' });
    }

    res.status(200).json({ message: 'Lưu FCM token thành công', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

module.exports = router;
