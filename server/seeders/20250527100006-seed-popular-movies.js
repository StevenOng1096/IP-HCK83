"use strict";
const axios = require("axios");
require("dotenv").config();

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const TMDB_API_KEY = process.env.TMDB_API_KEY;
    const movies = [];

    try {
      // Just popular movies - simpler approach
      for (let i = 1; i <= 25; i++) {
        const response = await axios.get(
          `https://api.themoviedb.org/3/movie/popular?language=en-US&page=${i}`,
          {
            headers: {
              Authorization: `Bearer ${TMDB_API_KEY}`,
            },
          }
        );

        const moviesWithOverview = response.data.results.filter(
          (movie) => movie.overview && movie.overview.trim() !== ""
        );

        const movieData = moviesWithOverview.map((movie) => ({
          tmdb_id: movie.id, // TMDB's ID from their API
          title: movie.title,
          overview: movie.overview || "",
          coverUrl: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
          genres: JSON.stringify(movie.genre_ids || []),
          ai_analysis: JSON.stringify({}),
          last_updated: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        }));

        movies.push(...movieData);
        // await new Promise((resolve) => setTimeout(resolve, 250));
      }

      await queryInterface.bulkInsert("Movies", movies);
      console.log(`✅ Seeded ${movies.length} popular movies!`);
    } catch (error) {
      console.error("❌ Error seeding movies:", error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Movies", null, {});
  },
};
