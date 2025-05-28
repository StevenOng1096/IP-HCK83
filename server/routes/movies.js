const express = require("express");
const MovieController = require("../controllers/MovieController");
const { authenticateToken } = require("../middleware/auth");
const router = express.Router();

// Public routes (no authentication required)
router.get("/", MovieController.getAllMovies); // Get all movies with filters
router.get("/popular", MovieController.getPopularMovies); // Get popular movies
router.get("/genres", MovieController.getGenres); // Get all genres
router.get("/search", MovieController.searchMovies); // Search movies

// Protected routes (authentication required) - Must come before /:id route
router.get(
  "/recommendations",
  authenticateToken,
  MovieController.getRecommendations
); // Get personalized recommendations

router.get(
  "/recommendations/ai",
  authenticateToken,
  MovieController.getAIMovieRecommendations
);

// Dynamic routes (must come last)
router.get("/:id", MovieController.getMovieById); // Get specific movie
router.get("/:id/similar", MovieController.getSimilarMovies); // Get similar movies

module.exports = router;
