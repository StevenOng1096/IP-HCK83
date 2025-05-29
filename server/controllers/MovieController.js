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

      if (
        error.name === "SequelizeDatabaseError" &&
        error.original?.code === "22P02"
      ) {
        return res.status(404).json({
          success: false,
          message: "Movie not found",
        });
      }

      res.status(500).json({
        success: false,
        message: "Failed to fetch movie",
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
