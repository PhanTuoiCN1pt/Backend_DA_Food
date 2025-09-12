const express = require("express");
const router = express.Router();
const notifyController = require("../controllers/notificationController");

// Gửi notification trực tiếp
router.post("/send", notifyController.sendNotification);

// Gửi notification food sắp hết hạn
router.post("/auto", notifyController.autoNotifyExpiringFoods);

module.exports = router;
