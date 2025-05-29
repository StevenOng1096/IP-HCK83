"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Movie extends Model {
    static associate(models) {
      Movie.hasMany(models.Watchlist, {
        foreignKey: "MovieId",
        as: "watchlists",
      });
      Movie.belongsToMany(models.Genre, {
        through: models.MovieGenre,
        foreignKey: "MovieId",
        otherKey: "GenreId",
        as: "genres",
      });
    }
  }
  Movie.init(
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      overview: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      coverUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      release_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Movie",
    }
  );
  return Movie;
};
