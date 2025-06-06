const express = require("express");
const WatchlistController = require("../controllers/WatchlistController");
const { authenticateToken } = require("../middleware/auth");
const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// CRUD Operations
router.get("/", WatchlistController.getUserWatchlist); // Get user's complete watchlist
router.post("/", WatchlistController.addToWatchlist); // Add movie to watchlist
router.patch("/:id", WatchlistController.updateWatchlistEntry); // Update watchlist entry (change status)
router.delete("/:id", WatchlistController.removeFromWatchlist); // Remove from watchlist

module.exports = router;
