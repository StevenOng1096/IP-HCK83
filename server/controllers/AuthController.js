const { User } = require("../models");
const { generateToken } = require("../helpers/jwt");
const { Op } = require("sequelize");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client();
require("dotenv").config();

class AuthController {
  // Register a new user
  static async register(req, res) {
    try {
      const { username, email, password, favorite_genres } = req.body;

      // Validation
      if (!username || !email || !password) {
        return res.status(400).json({
          success: false,
          message: "Username, email, and password are required",
        });
      }

      // Validate favorite_genres if provided
      if (favorite_genres && Array.isArray(favorite_genres)) {
        for (const genreId of favorite_genres) {
          if (
            typeof genreId !== "number" ||
            !Number.isInteger(genreId) ||
            genreId <= 0
          ) {
            return res.status(400).json({
              success: false,
              message:
                "Invalid favorite_genres format. Must be an array of positive integers",
            });
          }
        }
      }

      // Check if user already exists
      const existingUser = await User.findOne({
        where: {
          [Op.or]: [{ email }, { username }],
        },
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "User with this email or username already exists",
        });
      }

      // Create new user (password will be automatically hashed by the beforeCreate hook)
      const newUser = await User.create({
        username,
        email,
        password,
        favorite_genres: favorite_genres || [],
      });

      // Generate token
      const token = generateToken(newUser);

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: {
          user: newUser.toJSON(),
          token,
        },
      });
    } catch (error) {
      console.error("Registration error:", error);

      if (error.name === "SequelizeValidationError") {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: error.errors.map((err) => ({
            field: err.path,
            message: err.message,
          })),
        });
      }

      if (error.name === "SequelizeUniqueConstraintError") {
        return res.status(400).json({
          success: false,
          message: "Username or email already exists",
        });
      }

      if (
        error.name === "SequelizeDatabaseError" &&
        error.original?.code === "22P02"
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid data format provided",
        });
      }

      res.status(500).json({
        success: false,
        message: "Internal server error during registration",
      });
    }
  }

  // Login user
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validation
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: "Email and password are required",
        });
      }

      // Find user by email
      const user = await User.findOne({ where: { email } });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }

      // Check password
      const isValidPassword = await user.checkPassword(password);

      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }

      // Generate token
      const token = generateToken(user);

      res.status(200).json({
        success: true,
        message: "Login successful",
        data: {
          user: user.toJSON(),
          token,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error during login",
      });
    }
  }

  // Get user profile (protected route)
  static async getProfile(req, res) {
    try {
      res.status(200).json({
        success: true,
        message: "Profile retrieved successfully",
        data: {
          user: req.user.toJSON(),
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Internal server error while fetching profile",
      });
    }
  }
  // Update user profile (protected route)
  static async updateProfile(req, res) {
    try {
      const { username, favorite_genres } = req.body;
      const userId = req.user.id;

      const updateData = {};
      if (username) updateData.username = username;
      if (favorite_genres !== undefined)
        updateData.favorite_genres = favorite_genres;

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          success: false,
          message: "No valid fields to update",
        });
      }

      await User.update(updateData, {
        where: { id: userId },
      });

      const updatedUser = await User.findByPk(userId);

      res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        data: {
          user: updatedUser.toJSON(),
        },
      });
    } catch (error) {
      console.error("Profile update error:", error);

      if (error.name === "SequelizeUniqueConstraintError") {
        return res.status(400).json({
          success: false,
          message: "Username already exists",
        });
      }

      res.status(500).json({
        success: false,
        message: "Internal server error while updating profile",
      });
    }
  }
  static async googleLogin(req, res) {
    try {
      const { id_token } = req.body;

      if (!id_token) {
        return res.status(400).json({
          success: false,
          message: "Google ID token is required",
        });
      }

      const ticket = await client.verifyIdToken({
        idToken: id_token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      const { email, name, sub: googleId } = payload;

      // Check if user exists
      let user = await User.findOne({ where: { email } });

      if (!user) {
        // Create new user with Google data
        user = await User.create({
          username: name,
          email,
          password: Math.random().toString(36).slice(-8), // Random password since it's Google auth
          favorite_genres: [],
        });
      }

      // Generate token
      const token = generateToken(user);

      res.status(200).json({
        success: true,
        message: "Google login successful",
        data: {
          user: user.toJSON(),
          token,
        },
        access_token: token, // For backward compatibility
        email: user.email,
      });
    } catch (error) {
      console.error("Google login error:", error);
      res.status(500).json({
        success: false,
        message: "Google authentication failed",
        error: error.message,
      });
    }
  }
}

module.exports = AuthController;
