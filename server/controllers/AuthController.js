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
      console.error("Profile error:", error);
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

  // Google login
  static async googleLogin(req, res) {
    try {
      const { id_token } = req.body;
      const ticket = await client.verifyIdToken({
        idToken: id_token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      const user = await User.findOne({ where: { email: payload.email } });

      if (!user) {
        const newUser = await User.create({
          username: payload.name,
          email: payload.email,
          password: Math.random().toString(36).slice(-8),
        });
        const access_token = generateToken({ id: newUser.id });
        return res.status(201).json({ access_token });
      }

      const access_token = generateToken({ id: user.id });
      res.status(200).json({ access_token });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = AuthController;
