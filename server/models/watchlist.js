"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Watchlist extends Model {
    static associate(models) {
      Watchlist.belongsTo(models.User, {
        foreignKey: "UserId",
        as: "user",
      });
      Watchlist.belongsTo(models.Movie, {
        foreignKey: "MovieId",
        as: "movie",
      });
    }
  }
  Watchlist.init(
    {
      UserId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
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
      status: {
        type: DataTypes.ENUM("want", "watched", "favorite"),
        allowNull: false,
        defaultValue: "want",
      },
    },
    {
      sequelize,
      modelName: "Watchlist",
    }
  );
  return Watchlist;
};
