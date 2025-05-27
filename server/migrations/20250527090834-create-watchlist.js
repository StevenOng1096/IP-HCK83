"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Watchlists", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      movie_id: {
        // Reference local Movies table, not TMDB directly
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Movies",
          key: "id", // Reference local movie ID
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      status: {
        type: Sequelize.ENUM("want", "watched", "favorite"),
        allowNull: false,
        defaultValue: "want",
      },
      ai_reason: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    await queryInterface.addIndex("Watchlists", ["user_id", "movie_id"], {
      unique: true,
      name: "watchlists_user_movie_unique",
    });

    await queryInterface.addIndex("Watchlists", ["user_id"], {
      name: "watchlists_user_id_index",
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Watchlists");
  },
};
