// routes/index.js
const router = require("express").Router();
const authRoutes = require("./auth");
// const movieRoutes = require("./movies");
// const recommendationRoutes = require("./recommendations");
// const watchlistRoutes = require("./watchlist");
// const userRoutes = require("./users");

// Mount routes
router.use("/auth", authRoutes);
// router.use("/movies", movieRoutes);
// router.use("/recommendations", recommendationRoutes);
// router.use("/watchlist", watchlistRoutes);
// router.use("/users", userRoutes);
router.get("/", (req, res) => {
  res.send("Welcome to the Movie Recommendation API!");
});

module.exports = router;
