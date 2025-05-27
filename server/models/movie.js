"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Movie extends Model {
    static associate(models) {
      Movie.hasMany(models.Watchlist, {
        foreignKey: "tmdb_movie_id",
        sourceKey: "tmdb_id",
        as: "watchlists",
      });
    }
  }
  Movie.init(
    {
      tmdb_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      overview: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      poster_path: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      genres: {
        type: DataTypes.JSON,
        defaultValue: [],
      },
      ai_analysis: {
        type: DataTypes.JSON,
        defaultValue: {},
      },
      last_updated: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "Movie",
      underscored: true,
    }
  );
  return Movie;
};
