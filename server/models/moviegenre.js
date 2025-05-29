"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class MovieGenre extends Model {
    static associate(models) {
      MovieGenre.belongsTo(models.Movie, {
        foreignKey: "MovieId",
        as: "movie",
      });
      MovieGenre.belongsTo(models.Genre, {
        foreignKey: "GenreId",
        as: "genre",
      });
    }
  }
  MovieGenre.init(
    {
      MovieId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Movies",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      GenreId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Genres",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
    },
    {
      sequelize,
      modelName: "MovieGenre",
    }
  );
  return MovieGenre;
};
