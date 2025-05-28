const express = require("express");
const WatchlistController = require("../controllers/WatchlistController");
const { authenticateToken } = require("../middleware/auth");
const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Analytics routes (must come before dynamic routes)
router.get("/stats", WatchlistController.getWatchlistStats); // Get watchlist statistics

// CRUD Operations
router.get("/", WatchlistController.getUserWatchlist); // Get user's complete watchlist
router.post("/", WatchlistController.addToWatchlist); // Add movie to watchlist
router.patch("/:id", WatchlistController.updateWatchlistEntry); // Update watchlist entry (change status)
router.delete("/:id", WatchlistController.removeFromWatchlist); // Remove from watchlist

// Status-based routes
router.get("/status/:status", WatchlistController.getMoviesByStatus); // Get movies by status (want/watched/favorite)

// Utility routes
router.get("/check/:movieId", WatchlistController.checkMovieInWatchlist); // Check if movie is in watchlist

module.exports = router;
