"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Watchlist, {
        foreignKey: "user_id",
        as: "watchlists",
      });
    }
  }
  User.init(
    {
      username: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isEmail: true,
        },
      },
      oauth_provider: {
        type: DataTypes.ENUM("google", "facebook", "discord"),
        allowNull: false,
      },
      oauth_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      favorite_genres: {
        type: DataTypes.JSON,
        defaultValue: [],
      },
    },
    {
      sequelize,
      modelName: "User",
      underscored: true,
    }
  );
  return User;
};
