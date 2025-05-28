const { generateContent } = require("../lib/gemini.api");
const { Movie, Genre, Watchlist, User } = require("../models");
const { Op, Sequelize } = require("sequelize");

class MovieController {
  // Get all movies with pagination and filters
  static async getAllMovies(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        genre,
        search,
        year,
        sort = "createdAt",
      } = req.query;

      const offset = (page - 1) * limit;

      // Build where conditions
      const whereConditions = {};

      if (search) {
        whereConditions.title = {
          [Op.iLike]: `%${search}%`,
        };
      }

      if (year) {
        whereConditions[Op.and] = [
          Sequelize.where(
            Sequelize.fn(
              "EXTRACT",
              Sequelize.literal('YEAR FROM "release_date"')
            ),
            year
          ),
        ];
      }

      // Build include for genre filtering
      const includeConditions = [
        {
          model: Genre,
          as: "genres",
          through: { attributes: [] },
          attributes: ["id", "name"],
          ...(genre && { where: { name: { [Op.iLike]: `%${genre}%` } } }),
        },
      ];

      // Build order conditions
      let orderConditions;
      switch (sort) {
        case "title":
          orderConditions = [["title", "ASC"]];
          break;
        case "release_date":
          orderConditions = [["release_date", "DESC"]];
          break;
        case "popularity":
          orderConditions = [
            [Sequelize.literal('"watchlistCount"'), "DESC"],
            ["createdAt", "DESC"],
          ];
          break;
        default:
          orderConditions = [["createdAt", "DESC"]];
      }

      const movies = await Movie.findAndCountAll({
        attributes: [
          "id",
          "title",
          "overview",
          "coverUrl",
          "release_date",
          "createdAt",
          [
            Sequelize.literal(`(
              SELECT COUNT(*)
              FROM "Watchlists" 
              WHERE "Watchlists"."MovieId" = "Movie"."id"
            )`),
            "watchlistCount",
          ],
        ],
        where: whereConditions,
        include: includeConditions,
        order: orderConditions,
        limit: parseInt(limit),
        offset: parseInt(offset),
        distinct: true,
      });

      res.status(200).json({
        success: true,
        message: "Movies retrieved successfully",
        data: {
          movies: movies.rows,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(movies.count / limit),
            totalMovies: movies.count,
            hasNextPage: page * limit < movies.count,
            hasPrevPage: page > 1,
          },
          filters: {
            genre,
            search,
            year,
            sort,
          },
        },
      });
    } catch (error) {
      console.error("Error fetching movies:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch movies",
        error: error.message,
      });
    }
  }

  // Get movie by ID with details
  static async getMovieById(req, res) {
    try {
      const { id } = req.params;

      const movie = await Movie.findByPk(id, {
        attributes: [
          "id",
          "title",
          "overview",
          "coverUrl",
          "release_date",
          "createdAt",
          [
            Sequelize.literal(`(
              SELECT COUNT(*)
              FROM "Watchlists" 
              WHERE "Watchlists"."MovieId" = "Movie"."id"
            )`),
            "watchlistCount",
          ],
        ],
        include: [
          {
            model: Genre,
            as: "genres",
            through: { attributes: [] },
            attributes: ["id", "name"],
          },
        ],
      });

      if (!movie) {
        return res.status(404).json({
          success: false,
          message: "Movie not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Movie retrieved successfully",
        data: {
          movie,
        },
      });
    } catch (error) {
      console.error("Error fetching movie:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch movie",
        error: error.message,
      });
    }
  }

  // Get popular movies (most added to watchlists)
  static async getPopularMovies(req, res) {
    try {
      const { page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;

      const popularMovies = await Movie.findAndCountAll({
        attributes: [
          "id",
          "title",
          "overview",
          "coverUrl",
          "release_date",
          [
            Sequelize.literal(`(
              SELECT COUNT(*)
              FROM "Watchlists" 
              WHERE "Watchlists"."MovieId" = "Movie"."id"
            )`),
            "watchlistCount",
          ],
        ],
        include: [
          {
            model: Genre,
            as: "genres",
            through: { attributes: [] },
            attributes: ["id", "name"],
          },
        ],
        having: Sequelize.literal('"watchlistCount" > 0'),
        order: [
          [Sequelize.literal('"watchlistCount"'), "DESC"],
          ["createdAt", "DESC"],
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        distinct: true,
      });

      res.status(200).json({
        success: true,
        message: "Popular movies retrieved successfully",
        data: {
          movies: popularMovies.rows,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(popularMovies.count / limit),
            totalMovies: popularMovies.count,
            hasNextPage: page * limit < popularMovies.count,
            hasPrevPage: page > 1,
          },
        },
      });
    } catch (error) {
      console.error("Error fetching popular movies:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch popular movies",
        error: error.message,
      });
    }
  }

  // Get all genres
  static async getGenres(req, res) {
    try {
      const genres = await Genre.findAll({
        attributes: ["id", "name"],
        order: [["name", "ASC"]],
      });

      res.status(200).json({
        success: true,
        message: "Genres retrieved successfully",
        data: {
          genres,
        },
      });
    } catch (error) {
      console.error("Error fetching genres:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch genres",
        error: error.message,
      });
    }
  }

  // Search movies by title
  static async searchMovies(req, res) {
    try {
      const { q: query, page = 1, limit = 20 } = req.query;

      if (!query) {
        return res.status(400).json({
          success: false,
          message: "Search query is required",
        });
      }

      const offset = (page - 1) * limit;

      const movies = await Movie.findAndCountAll({
        attributes: [
          "id",
          "title",
          "overview",
          "coverUrl",
          "release_date",
          [
            Sequelize.literal(`(
              SELECT COUNT(*)
              FROM "Watchlists" 
              WHERE "Watchlists"."MovieId" = "Movie"."id"
            )`),
            "watchlistCount",
          ],
        ],
        where: {
          [Op.or]: [
            {
              title: {
                [Op.iLike]: `%${query}%`,
              },
            },
            {
              overview: {
                [Op.iLike]: `%${query}%`,
              },
            },
          ],
        },
        include: [
          {
            model: Genre,
            as: "genres",
            through: { attributes: [] },
            attributes: ["id", "name"],
          },
        ],
        order: [
          [Sequelize.literal('"watchlistCount"'), "DESC"],
          ["title", "ASC"],
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        distinct: true,
      });

      res.status(200).json({
        success: true,
        message: `Search results for "${query}"`,
        data: {
          movies: movies.rows,
          searchQuery: query,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(movies.count / limit),
            totalMovies: movies.count,
            hasNextPage: page * limit < movies.count,
            hasPrevPage: page > 1,
          },
        },
      });
    } catch (error) {
      console.error("Error searching movies:", error);
      res.status(500).json({
        success: false,
        message: "Failed to search movies",
        error: error.message,
      });
    }
  }

  // Get similar movies based on genres
  static async getSimilarMovies(req, res) {
    try {
      const { id } = req.params;
      const { limit = 10 } = req.query;

      // First get the target movie with its genres
      const targetMovie = await Movie.findByPk(id, {
        include: [
          {
            model: Genre,
            as: "genres",
            through: { attributes: [] },
            attributes: ["id", "name"],
          },
        ],
      });

      if (!targetMovie) {
        return res.status(404).json({
          success: false,
          message: "Movie not found",
        });
      }

      const genreIds = targetMovie.genres.map((genre) => genre.id);

      if (genreIds.length === 0) {
        return res.status(200).json({
          success: true,
          message: "No similar movies found",
          data: {
            movies: [],
            targetMovie: {
              id: targetMovie.id,
              title: targetMovie.title,
            },
          },
        });
      }

      // Find movies with similar genres
      const similarMovies = await Movie.findAll({
        attributes: [
          "id",
          "title",
          "overview",
          "coverUrl",
          "release_date",
          [
            Sequelize.literal(`(
              SELECT COUNT(*)
              FROM "Watchlists" 
              WHERE "Watchlists"."MovieId" = "Movie"."id"
            )`),
            "watchlistCount",
          ],
        ],
        include: [
          {
            model: Genre,
            as: "genres",
            through: { attributes: [] },
            attributes: ["id", "name"],
            where: {
              id: {
                [Op.in]: genreIds,
              },
            },
          },
        ],
        where: {
          id: {
            [Op.ne]: id, // Exclude the target movie itself
          },
        },
        order: [
          [Sequelize.literal('"watchlistCount"'), "DESC"],
          ["createdAt", "DESC"],
        ],
        limit: parseInt(limit),
        distinct: true,
      });

      res.status(200).json({
        success: true,
        message: "Similar movies retrieved successfully",
        data: {
          movies: similarMovies,
          targetMovie: {
            id: targetMovie.id,
            title: targetMovie.title,
            genres: targetMovie.genres,
          },
        },
      });
    } catch (error) {
      console.error("Error fetching similar movies:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch similar movies",
        error: error.message,
      });
    }
  }

  // Get personalized recommendations for authenticated user
  static async getRecommendations(req, res) {
    try {
      const userId = req.user.id;
      const { limit = 20 } = req.query;

      // Get user's favorite genres and watchlist
      const user = await User.findByPk(userId, {
        include: [
          {
            model: Watchlist,
            as: "watchlists",
            include: [
              {
                model: Movie,
                as: "movie",
                include: [
                  {
                    model: Genre,
                    as: "genres",
                    through: { attributes: [] },
                    attributes: ["id"],
                  },
                ],
              },
            ],
          },
        ],
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Get genre preferences from user's favorite_genres and watchlist history
      let preferredGenreIds = user.favorite_genres || [];

      // Also include genres from user's watchlist
      const watchlistGenreIds = user.watchlists
        .flatMap((w) => w.movie.genres.map((g) => g.id))
        .filter((id, index, arr) => arr.indexOf(id) === index); // Remove duplicates

      preferredGenreIds = [
        ...new Set([...preferredGenreIds, ...watchlistGenreIds]),
      ];

      // Get movies user has already watched
      const watchedMovieIds = user.watchlists.map((w) => w.MovieId);

      let whereConditions = {
        id: {
          [Op.notIn]: watchedMovieIds, // Exclude already watched movies
        },
      };

      let includeConditions = [
        {
          model: Genre,
          as: "genres",
          through: { attributes: [] },
          attributes: ["id", "name"],
        },
      ];

      // If user has genre preferences, filter by them
      if (preferredGenreIds.length > 0) {
        includeConditions[0].where = {
          id: {
            [Op.in]: preferredGenreIds,
          },
        };
      }

      const recommendations = await Movie.findAll({
        attributes: [
          "id",
          "title",
          "overview",
          "coverUrl",
          "release_date",
          [
            Sequelize.literal(`(
              SELECT COUNT(*)
              FROM "Watchlists" 
              WHERE "Watchlists"."MovieId" = "Movie"."id"
            )`),
            "watchlistCount",
          ],
        ],
        where: whereConditions,
        include: includeConditions,
        order: [
          [Sequelize.literal('"watchlistCount"'), "DESC"],
          ["createdAt", "DESC"],
        ],
        limit: parseInt(limit),
        distinct: true,
      });

      res.status(200).json({
        success: true,
        message: "Personalized recommendations retrieved successfully",
        data: {
          movies: recommendations,
          userPreferences: {
            favoriteGenres: preferredGenreIds,
            watchedCount: watchedMovieIds.length,
          },
        },
      });
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch recommendations",
        error: error.message,
      });
    }
  }

  static async getAIMovieRecommendations(req, res) {
    try {
      const userGenres = req.user.favorite_genres || [];

      let userGenreNames = [];
      if (userGenres.length > 0) {
        const genres = await Genre.findAll({
          where: {
            id: {
              [Op.in]: userGenres,
            },
          },
          attributes: ["id", "name"],
        });

        userGenreNames = genres.map((genre) => genre.name); // Convert to array of strings
      }

      const dataMovies = await Movie.findAll({
        attributes: ["id", "title", "overview", "coverUrl", "release_date"],
      });

      const prompt = `
      I want you to recommend the user with top 3 movies

      from the list below:
      ${dataMovies
        .map((movie) => `- ${movie.title} (ID: ${movie.id})`)
        .join("\n")}

      based on the following criteria:
      - Highly rated
      - Genre: ${userGenreNames.join(", ")}
      `;

      const generation = await generateContent(prompt);

      const parsedOutput = JSON.parse(generation);

      console.log("Generation:", parsedOutput);

      const movies = dataMovies.filter((movie) =>
        parsedOutput.includes(movie.id)
      );

      res.status(200).json({
        message: "Hello from Gemini API",
        generation: parsedOutput,
        movies,
      });
    } catch (error) {
      console.error("Error generating AI movie recommendations:", error);
      res.status(500).json({
        success: false,
        message: "Failed to generate AI movie recommendations",
        error: error.message,
      });
    }
  }
}

module.exports = MovieController;
