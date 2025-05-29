const express = require("express");
const MovieController = require("../controllers/MovieController");
const { authenticateToken } = require("../middleware/auth");
const router = express.Router();

// Public routes (no authentication required)
router.get("/", MovieController.getAllMovies); // Get all movies with filters

router.get(
  "/recommendations/ai",
  authenticateToken,
  MovieController.getAIMovieRecommendations
);

// Dynamic routes (must come last)
router.get("/:id", MovieController.getMovieById); // Get specific movie

module.exports = router;
