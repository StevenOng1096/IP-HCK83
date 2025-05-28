"use strict";
const axios = require("axios");
require("dotenv").config();

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const TMDB_API_KEY = process.env.TMDB_API_KEY;
    const movies = [];
    const movieGenreRelations = [];

    try {
      // First, get the mapping of TMDB genre IDs to local Genre IDs
      const genreResponse = await axios.get(
        "https://api.themoviedb.org/3/genre/movie/list?language=en",
        {
          headers: {
            Authorization: `Bearer ${TMDB_API_KEY}`,
          },
        }
      );

      const tmdbGenres = genreResponse.data.genres;
      const localGenres = await queryInterface.sequelize.query(
        'SELECT id, name FROM "Genres"',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );

      // Create mapping: TMDB genre ID -> Local genre ID
      const genreMapping = {};
      tmdbGenres.forEach((tmdbGenre) => {
        const localGenre = localGenres.find((lg) => lg.name === tmdbGenre.name);
        if (localGenre) {
          genreMapping[tmdbGenre.id] = localGenre.id;
        }
      });

      console.log("🎬 Fetching and seeding movies with genre relationships...");

      for (let i = 1; i <= 10; i++) {
        const response = await axios.get(
          `https://api.themoviedb.org/3/movie/popular?language=en-US&page=${i}`,
          {
            headers: {
              Authorization: `Bearer ${TMDB_API_KEY}`,
            },
          }
        );

        const filteredMovies = response.data.results.filter((movie) => {
          return (
            movie.overview &&
            movie.overview.trim() !== "" &&
            movie.poster_path &&
            movie.genre_ids &&
            movie.genre_ids.length > 0 &&
            movie.release_date &&
            movie.title &&
            movie.title.trim() !== ""
          );
        });

        const movieData = filteredMovies.map((movie) => ({
          title: movie.title,
          overview: movie.overview,
          coverUrl: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
          release_date: movie.release_date,
          createdAt: new Date(),
          updatedAt: new Date(),
        }));

        movies.push(...movieData);

        // Store genre relationships for later insertion
        filteredMovies.forEach((movie, index) => {
          const movieIndex = movies.length - filteredMovies.length + index;
          movie.genre_ids.forEach((tmdbGenreId) => {
            const localGenreId = genreMapping[tmdbGenreId];
            if (localGenreId) {
              movieGenreRelations.push({
                movieIndex: movieIndex, // We'll update this with actual movie ID after insertion
                genreId: localGenreId,
                tmdbGenreId: tmdbGenreId,
              });
            }
          });
        });
      }

      // Insert movies first
      await queryInterface.bulkInsert("Movies", movies);
      console.log(`✅ Seeded ${movies.length} movies!`);

      // Get the inserted movies to get their actual IDs
      const insertedMovies = await queryInterface.sequelize.query(
        'SELECT id, title FROM "Movies" ORDER BY id',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );

      // Create MovieGenre relationships
      const movieGenreData = [];
      movieGenreRelations.forEach((relation) => {
        const movie = insertedMovies[relation.movieIndex];
        if (movie) {
          movieGenreData.push({
            MovieId: movie.id,
            GenreId: relation.genreId,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      });

      if (movieGenreData.length > 0) {
        await queryInterface.bulkInsert("MovieGenres", movieGenreData);
        console.log(
          `✅ Created ${movieGenreData.length} movie-genre relationships!`
        );
      }

      console.log("🎉 Movie seeding completed successfully!");
    } catch (error) {
      console.error("❌ Error seeding movies:", error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("MovieGenres", null, {});
    await queryInterface.bulkDelete("Movies", null, {});
  },
};
