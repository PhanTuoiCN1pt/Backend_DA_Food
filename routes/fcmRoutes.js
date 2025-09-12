const express = require("express");
const router = express.Router();
const fcmController = require("../controllers/fcmController");

router.post("/send", fcmController.sendNotification);

module.exports = router;

