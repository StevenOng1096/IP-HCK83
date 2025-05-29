"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Movies", "genres");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn("Movies", "genres", {
      type: Sequelize.ARRAY(Sequelize.INTEGER),
      defaultValue: [],
      allowNull: true,
    });
  },
};
