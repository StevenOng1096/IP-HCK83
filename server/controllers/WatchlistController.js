const { Watchlist, Movie, Genre, User } = require("../models");
const { Op } = require("sequelize");

class WatchlistController {
  // Get user's complete watchlist
  static async getUserWatchlist(req, res) {
    try {
      const userId = req.user.id;
      const { status, page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;

      // Build where conditions
      const whereConditions = { UserId: userId };
      if (status) {
        whereConditions.status = status;
      }

      const watchlist = await Watchlist.findAndCountAll({
        where: whereConditions,
        include: [
          {
            model: Movie,
            as: "movie",
            attributes: ["id", "title", "overview", "coverUrl", "release_date"],
            include: [
              {
                model: Genre,
                as: "genres",
                through: { attributes: [] },
                attributes: ["id", "name"],
              },
            ],
          },
        ],
        order: [["createdAt", "DESC"]],
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      res.status(200).json({
        success: true,
        message: "Watchlist retrieved successfully",
        data: {
          watchlist: watchlist.rows,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(watchlist.count / limit),
            totalItems: watchlist.count,
            hasNextPage: page * limit < watchlist.count,
            hasPrevPage: page > 1,
          },
          filters: {
            status,
          },
        },
      });
    } catch (error) {
      console.error("Error fetching watchlist:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch watchlist",
        error: error.message,
      });
    }
  }
  // Add movie to watchlist
  static async addToWatchlist(req, res) {
    try {
      const userId = req.user.id;
      const { movieId, status = "want" } = req.body;

      // Validation
      if (!movieId) {
        return res.status(400).json({
          success: false,
          message: "Movie ID is required",
        });
      }

      // Check if movie exists
      const movie = await Movie.findByPk(movieId);
      if (!movie) {
        return res.status(404).json({
          success: false,
          message: "Movie not found",
        });
      }

      // Check if movie is already in user's watchlist
      const existingEntry = await Watchlist.findOne({
        where: {
          UserId: userId,
          MovieId: movieId,
        },
      });

      if (existingEntry) {
        return res.status(400).json({
          success: false,
          message: "Movie is already in your watchlist",
          data: {
            currentStatus: existingEntry.status,
          },
        });
      }

      // Add to watchlist
      const watchlistEntry = await Watchlist.create({
        UserId: userId,
        MovieId: movieId,
        status,
      });

      // Get the complete entry with movie details
      const completeEntry = await Watchlist.findByPk(watchlistEntry.id, {
        include: [
          {
            model: Movie,
            as: "movie",
            attributes: ["id", "title", "overview", "coverUrl", "release_date"],
            include: [
              {
                model: Genre,
                as: "genres",
                through: { attributes: [] },
                attributes: ["id", "name"],
              },
            ],
          },
        ],
      });

      res.status(201).json({
        success: true,
        message: "Movie added to watchlist successfully",
        data: {
          watchlistEntry: completeEntry,
        },
      });
    } catch (error) {
      console.error("Error adding to watchlist:", error);

      if (
        error.name === "SequelizeDatabaseError" &&
        error.original?.code === "22P02"
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid data format provided",
        });
      }

      res.status(500).json({
        success: false,
        message: "Failed to add movie to watchlist",
        error: error.message,
      });
    }
  }

  // Update watchlist entry status
  static async updateWatchlistEntry(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const { status } = req.body;

      // Validation
      if (!status) {
        return res.status(400).json({
          success: false,
          message: "Status is required",
        });
      }

      const validStatuses = ["want", "watched", "favorite"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status. Must be one of: ${validStatuses.join(
            ", "
          )}`,
        });
      }

      // Find and update the watchlist entry
      const watchlistEntry = await Watchlist.findOne({
        where: {
          id,
          UserId: userId,
        },
      });

      if (!watchlistEntry) {
        return res.status(404).json({
          success: false,
          message: "Watchlist entry not found",
        });
      }

      // Update the status
      await watchlistEntry.update({ status });

      // Get the updated entry with movie details
      const updatedEntry = await Watchlist.findByPk(id, {
        include: [
          {
            model: Movie,
            as: "movie",
            attributes: ["id", "title", "overview", "coverUrl", "release_date"],
            include: [
              {
                model: Genre,
                as: "genres",
                through: { attributes: [] },
                attributes: ["id", "name"],
              },
            ],
          },
        ],
      });

      res.status(200).json({
        success: true,
        message: "Watchlist entry updated successfully",
        data: {
          watchlistEntry: updatedEntry,
        },
      });
    } catch (error) {
      console.error("Error updating watchlist entry:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update watchlist entry",
        error: error.message,
      });
    }
  }

  // Remove movie from watchlist
  static async removeFromWatchlist(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      // Find the watchlist entry
      const watchlistEntry = await Watchlist.findOne({
        where: {
          id,
          UserId: userId,
        },
        include: [
          {
            model: Movie,
            as: "movie",
            attributes: ["id", "title"],
          },
        ],
      });

      if (!watchlistEntry) {
        return res.status(404).json({
          success: false,
          message: "Watchlist entry not found",
        });
      }

      const movieTitle = watchlistEntry.movie.title;

      // Delete the entry
      await watchlistEntry.destroy();

      res.status(200).json({
        success: true,
        message: `"${movieTitle}" removed from watchlist successfully`,
      });
    } catch (error) {
      console.error("Error removing from watchlist:", error);
      res.status(500).json({
        success: false,
        message: "Failed to remove movie from watchlist",
        error: error.message,
      });
    }
  }
}

module.exports = WatchlistController;
