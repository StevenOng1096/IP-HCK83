"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Genre extends Model {
    static associate(models) {
      Genre.belongsToMany(models.Movie, {
        through: models.MovieGenre,
        foreignKey: "GenreId",
        otherKey: "MovieId",
        as: "movies",
      });
    }
  }

  Genre.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
    },
    {
      sequelize,
      modelName: "Genre",
    }
  );
  return Genre;
};
