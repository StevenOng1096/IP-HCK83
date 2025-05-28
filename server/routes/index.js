// routes/index.js
const router = require("express").Router();
const authRoutes = require("./auth");
const movieRoutes = require("./movies");
const watchlistRoutes = require("./watchlist");

// Mount routes
router.use("/auth", authRoutes);
router.use("/movies", movieRoutes);
router.use("/watchlist", watchlistRoutes);
router.get("/", (req, res) => {
  res.send("Welcome to the Movie Recommendation API!");
});

module.exports = router;

// router.use("/recommendations", recommendationRoutes); // ❌ Not needed - use /movies/recommendations
// router.use("/users", userRoutes); // ❌ Not needed - use /auth routes
