"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Movies", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      overview: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      coverUrl: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      genres: {
        type: Sequelize.ARRAY(Sequelize.INTEGER),
        defaultValue: [],
        allowNull: true,
      },
      release_date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Movies");
  },
};
