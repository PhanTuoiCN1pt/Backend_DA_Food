const express = require("express");
const router = express.Router();
const { createHousehold,joinByInvite,getAllHouseholds,getHouseholdsByUserId, removeMember } = require("../controllers/householdController");
const authMiddleware = require("../middleware/authMiddleware");

// POST /api/households/create
router.post("/create", authMiddleware, createHousehold);

// POST /api/households/join
router.post("/join", joinByInvite);

// Get all households (for testing)
router.get("/",getAllHouseholds); 

// GET /api/households/user/:userId
router.get("/user/:userId", getHouseholdsByUserId);

// DELETE /api/households/remove-member/:householdId
router.delete(
  "/remove-member/:householdId",
  authMiddleware, // ✅ kiểm tra token
  removeMember
);

module.exports = router;
