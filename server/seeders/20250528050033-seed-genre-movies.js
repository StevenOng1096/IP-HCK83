"use strict";
const axios = require("axios");
require("dotenv").config();

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const TMDB_API_KEY = process.env.TMDB_API_KEY;

    try {
      console.log("🎬 Fetching genres from TMDB...");

      const response = await axios.get(
        "https://api.themoviedb.org/3/genre/movie/list?language=en",
        {
          headers: {
            Authorization: `Bearer ${TMDB_API_KEY}`,
          },
        }
      );

      const genreData = response.data.genres.map((genre) => ({
        name: genre.name,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      await queryInterface.bulkInsert("Genres", genreData);
      console.log(`✅ Seeded ${genreData.length} genres successfully!`);

      // Log the genres for reference
      console.log("📋 Seeded genres:", genreData.map((g) => g.name).join(", "));
    } catch (error) {
      console.error("❌ Error seeding genres:", error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Genres", null, {});
    console.log("🗑️ All genres deleted");
  },
};
