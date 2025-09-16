const express = require("express");
const router = express.Router();
const recipeController = require("../controllers/recipeController");

// -------------------- ADMIN CRUD --------------------
router.get("/", recipeController.adminGetAllRecipes);
router.get("/:id", recipeController.adminGetRecipeById);
router.post("/", recipeController.adminCreateRecipe);
router.put("/:id", recipeController.adminUpdateRecipe);
router.delete("/:id", recipeController.adminDeleteRecipe);

module.exports = router;
