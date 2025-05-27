"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Watchlist extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Watchlist.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "user",
      });

      // Watchlist belongs to Movie (local Movies table)
      Watchlist.belongsTo(models.Movie, {
        foreignKey: "movie_id",
        as: "movie",
      });
    }
  }
  Watchlist.init(
    {
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      movie_id: {
        // Changed from tmdb_movie_id
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("want", "watched", "favorite"),
        allowNull: false,
        defaultValue: "want",
      },
      ai_reason: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Watchlist",
      underscored: true,
      indexes: [
        {
          unique: true,
          fields: ["user_id", "tmdb_movie_id"], // Prevent duplicate entries
        },
      ],
    }
  );
  return Watchlist;
};
