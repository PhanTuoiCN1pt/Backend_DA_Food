const express = require("express");
const router = express.Router();
const { createHousehold,joinByInvite } = require("../controllers/householdController");
const authMiddleware = require("../middleware/authMiddleware");

// POST /api/households/create
router.post("/create", authMiddleware, createHousehold);

// POST /api/households/join
router.post("/join", joinByInvite);

module.exports = router;
