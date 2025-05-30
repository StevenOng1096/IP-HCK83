require("dotenv").config();
process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../app");
const {
  User,
  Movie,
  Genre,
  Watchlist,
  MovieGenre,
  sequelize,
} = require("../models");
const { generateToken } = require("../helpers/jwt");

describe("Movie Recommendation API Integration Tests", () => {
  let testUser1, testUser2;
  let testMovie1, testMovie2, testMovie3;
  let testGenre1, testGenre2, testGenre3;
  let authToken1, authToken2;
  let watchlistEntry1, watchlistEntry2;

  beforeAll(async () => {
    await sequelize.sync({ force: true });

    // Create genres
    testGenre1 = await Genre.create({ name: "Action" });
    testGenre2 = await Genre.create({ name: "Comedy" });
    testGenre3 = await Genre.create({ name: "Drama" });

    // Create movies
    testMovie1 = await Movie.create({
      title: "Test Action Movie",
      overview: "An exciting action movie for testing",
      coverUrl: "https://example.com/action-movie.jpg",
      release_date: "2023-01-15",
    });
    testMovie2 = await Movie.create({
      title: "Test Comedy Movie",
      overview: "A hilarious comedy for testing",
      coverUrl: "https://example.com/comedy-movie.jpg",
      release_date: "2023-06-10",
    });
    testMovie3 = await Movie.create({
      title: "Test Drama Movie",
      overview: "A touching drama for testing",
      coverUrl: "https://example.com/drama-movie.jpg",
      release_date: "2023-12-01",
    });

    // Associate movies with genres
    await MovieGenre.create({ MovieId: testMovie1.id, GenreId: testGenre1.id });
    await MovieGenre.create({ MovieId: testMovie2.id, GenreId: testGenre2.id });
    await MovieGenre.create({ MovieId: testMovie3.id, GenreId: testGenre3.id });

    // Create users
    testUser1 = await User.create({
      username: "testuser1",
      email: "testuser1@example.com",
      password: "password123",
      favorite_genres: [testGenre1.id, testGenre2.id],
    });
    testUser2 = await User.create({
      username: "testuser2",
      email: "testuser2@example.com",
      password: "password456",
      favorite_genres: [testGenre3.id],
    });

    // Generate tokens
    authToken1 = generateToken(testUser1);
    authToken2 = generateToken(testUser2);
  });

  afterAll(async () => {
    await MovieGenre.destroy({ where: {} });
    await Watchlist.destroy({ where: {} });
    await Movie.destroy({ where: {} });
    await Genre.destroy({ where: {} });
    await User.destroy({ where: {} });
    await sequelize.close();
  });

  // Authentication Endpoints Tests
  describe("Authentication Endpoints", () => {
    describe("POST /api/auth/register", () => {
      it("should register a new user successfully", async () => {
        const userData = {
          username: "newuser",
          email: "newuser@example.com",
          password: "password123",
          favorite_genres: [testGenre1.id, testGenre2.id],
        };

        const res = await request(app)
          .post("/api/auth/register")
          .send(userData)
          .expect(201);

        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("User registered successfully");
        expect(res.body.data.user.username).toBe(userData.username);
        expect(res.body.data.user.email).toBe(userData.email);
        expect(res.body.data.token).toBeDefined();
        expect(res.body.data.user.favorite_genres).toEqual(
          userData.favorite_genres
        );

        // Cleanup
        await User.destroy({ where: { email: userData.email } });
      });

      it("should fail to register with missing required fields", async () => {
        const res = await request(app)
          .post("/api/auth/register")
          .send({ username: "incomplete" })
          .expect(400);

        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe(
          "Username, email, and password are required"
        );
      });

      it("should fail to register with duplicate email", async () => {
        const res = await request(app)
          .post("/api/auth/register")
          .send({
            username: "duplicate",
            email: testUser1.email,
            password: "password123",
          })
          .expect(400);

        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe(
          "User with this email or username already exists"
        );
      });

      it("should fail to register with invalid favorite_genres format", async () => {
        const res = await request(app)
          .post("/api/auth/register")
          .send({
            username: "invalidgenres",
            email: "invalidgenres@example.com",
            password: "password123",
            favorite_genres: ["invalid", -1],
          })
          .expect(400);

        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe(
          "Invalid favorite_genres format. Must be an array of positive integers"
        );
      });
    });

    describe("POST /api/auth/login", () => {
      it("should login user successfully", async () => {
        const res = await request(app)
          .post("/api/auth/login")
          .send({
            email: testUser1.email,
            password: "password123",
          })
          .expect(200);

        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("Login successful");
        expect(res.body.data.user.email).toBe(testUser1.email);
        expect(res.body.data.token).toBeDefined();
      });

      it("should fail to login with missing email", async () => {
        const res = await request(app)
          .post("/api/auth/login")
          .send({ password: "password123" })
          .expect(400);

        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("Email and password are required");
      });

      it("should fail to login with missing password", async () => {
        const res = await request(app)
          .post("/api/auth/login")
          .send({ email: testUser1.email })
          .expect(400);

        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("Email and password are required");
      });

      it("should fail to login with invalid credentials", async () => {
        const res = await request(app)
          .post("/api/auth/login")
          .send({
            email: testUser1.email,
            password: "wrongpassword",
          })
          .expect(401);

        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("Invalid email or password");
      });

      it("should fail to login with non-existent email", async () => {
        const res = await request(app)
          .post("/api/auth/login")
          .send({
            email: "nonexistent@example.com",
            password: "password123",
          })
          .expect(401);

        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("Invalid email or password");
      });
    });

    describe("POST /api/auth/google-login", () => {
      it("should fail without id_token", async () => {
        const res = await request(app)
          .post("/api/auth/google-login")
          .send({})
          .expect(400);

        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("Google ID token is required");
      });

      it("should fail with invalid id_token", async () => {
        const res = await request(app)
          .post("/api/auth/google-login")
          .send({ id_token: "invalid_token" })
          .expect(500);

        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("Google authentication failed");
      });
    });

    describe("GET /api/auth/profile", () => {
      it("should get user profile successfully", async () => {
        const res = await request(app)
          .get("/api/auth/profile")
          .set("Authorization", `Bearer ${authToken1}`)
          .expect(200);

        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("Profile retrieved successfully");
        expect(res.body.data.user.id).toBe(testUser1.id);
        expect(res.body.data.user.email).toBe(testUser1.email);
        expect(res.body.data.user.username).toBe(testUser1.username);
      });

      it("should fail without authentication token", async () => {
        const res = await request(app).get("/api/auth/profile").expect(401);

        expect(res.body.success).toBe(false);
      });

      it("should fail with invalid token", async () => {
        const res = await request(app)
          .get("/api/auth/profile")
          .set("Authorization", "Bearer invalid_token")
          .expect(401);

        expect(res.body.success).toBe(false);
      });
    });

    describe("PATCH /api/auth/profile", () => {
      it("should update user profile successfully", async () => {
        const updateData = {
          username: "updateduser",
          favorite_genres: [testGenre1.id, testGenre3.id],
        };

        const res = await request(app)
          .patch("/api/auth/profile")
          .set("Authorization", `Bearer ${authToken1}`)
          .send(updateData)
          .expect(200);

        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("Profile updated successfully");
        expect(res.body.data.user.username).toBe(updateData.username);
        expect(res.body.data.user.favorite_genres).toEqual(
          updateData.favorite_genres
        );
      });

      it("should fail without authentication token", async () => {
        const res = await request(app)
          .patch("/api/auth/profile")
          .send({ username: "newname" })
          .expect(401);

        expect(res.body.success).toBe(false);
      });

      it("should fail with invalid favorite_genres format", async () => {
        const res = await request(app)
          .patch("/api/auth/profile")
          .set("Authorization", `Bearer ${authToken1}`)
          .send({ favorite_genres: ["invalid"] })
          .expect(500);

        expect(res.body.success).toBe(false);
      });
    });
  });

  // Movie Endpoints Tests
  describe("Movie Endpoints", () => {
    describe("GET /api/movies", () => {
      it("should get all movies successfully", async () => {
        const res = await request(app).get("/api/movies").expect(200);

        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("Movies retrieved successfully");
        expect(res.body.data.movies).toBeInstanceOf(Array);
        expect(res.body.data.pagination).toBeDefined();
        expect(res.body.data.pagination.currentPage).toBe(1);
        expect(res.body.data.pagination.totalMovies).toBeGreaterThan(0);
      });

      it("should filter movies by genre", async () => {
        const res = await request(app)
          .get("/api/movies?genre=Action")
          .expect(200);

        expect(res.body.success).toBe(true);
        expect(res.body.data.filters.genre).toBe("Action");
        if (res.body.data.movies.length > 0) {
          expect(
            res.body.data.movies[0].genres.some((g) =>
              g.name.includes("Action")
            )
          ).toBe(true);
        }
      });

      it("should search movies by title", async () => {
        const res = await request(app)
          .get("/api/movies?search=Action")
          .expect(200);

        expect(res.body.success).toBe(true);
        expect(res.body.data.filters.search).toBe("Action");
      });

      it("should filter movies by year", async () => {
        const res = await request(app).get("/api/movies?year=2023").expect(200);

        expect(res.body.success).toBe(true);
        expect(res.body.data.filters.year).toBe("2023");
      });

      it("should sort movies by title", async () => {
        const res = await request(app)
          .get("/api/movies?sort=title")
          .expect(200);

        expect(res.body.success).toBe(true);
        expect(res.body.data.filters.sort).toBe("title");
      });

      it("should sort movies by release_date", async () => {
        const res = await request(app)
          .get("/api/movies?sort=release_date")
          .expect(200);

        expect(res.body.success).toBe(true);
        expect(res.body.data.filters.sort).toBe("release_date");
      });

      it("should sort movies by popularity", async () => {
        const res = await request(app)
          .get("/api/movies?sort=popularity")
          .expect(200);

        expect(res.body.success).toBe(true);
        expect(res.body.data.filters.sort).toBe("popularity");
      });

      it("should handle pagination", async () => {
        const res = await request(app)
          .get("/api/movies?page=1&limit=2")
          .expect(200);

        expect(res.body.success).toBe(true);
        expect(res.body.data.pagination.currentPage).toBe(1);
        expect(res.body.data.movies.length).toBeLessThanOrEqual(2);
      });

      it("should handle multiple query parameters", async () => {
        const res = await request(app)
          .get("/api/movies?genre=Action&year=2023&sort=title&page=1&limit=5")
          .expect(200);

        expect(res.body.success).toBe(true);
        expect(res.body.data.pagination.currentPage).toBe(1);
      });

      it("should handle empty search results", async () => {
        const res = await request(app)
          .get("/api/movies?search=NonExistentMovieTitle123")
          .expect(200);

        expect(res.body.success).toBe(true);
        expect(res.body.data.movies.length).toBe(0);
      });
    });

    describe("GET /api/movies/:id", () => {
      it("should get movie by ID successfully", async () => {
        const res = await request(app)
          .get(`/api/movies/${testMovie1.id}`)
          .expect(200);

        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("Movie retrieved successfully");
        expect(res.body.data.movie.id).toBe(testMovie1.id);
        expect(res.body.data.movie.title).toBe(testMovie1.title);
        expect(res.body.data.movie.genres).toBeInstanceOf(Array);
        expect(res.body.data.movie.watchlistCount).toBeDefined();
      });

      it("should return 404 for non-existent movie", async () => {
        const res = await request(app).get("/api/movies/99999").expect(404);

        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("Movie not found");
      });

      it("should handle invalid movie ID gracefully", async () => {
        const res = await request(app).get("/api/movies/invalid").expect(404);

        expect(res.body.success).toBe(false);
      });
    });

    describe("GET /api/movies/recommendations/ai", () => {
      it("should get AI recommendations with valid token", async () => {
        const res = await request(app)
          .get("/api/movies/recommendations/ai")
          .set("Authorization", `Bearer ${authToken1}`)
          .expect(200);

        expect(res.body.message).toBe("Hello from Gemini API");
        expect(res.body.generation).toBeDefined();
        expect(res.body.movies).toBeInstanceOf(Array);
      });

      it("should fail without authentication token", async () => {
        const res = await request(app)
          .get("/api/movies/recommendations/ai")
          .expect(401);

        expect(res.body.success).toBe(false);
      });

      it("should fail with invalid token", async () => {
        const res = await request(app)
          .get("/api/movies/recommendations/ai")
          .set("Authorization", "Bearer invalid_token")
          .expect(401);

        expect(res.body.success).toBe(false);
      });
    });
  });

  // Watchlist Endpoints Tests
  describe("Watchlist Endpoints", () => {
    describe("POST /api/watchlist", () => {
      it("should add movie to watchlist successfully", async () => {
        const res = await request(app)
          .post("/api/watchlist")
          .set("Authorization", `Bearer ${authToken1}`)
          .send({ movieId: testMovie1.id, status: "want" })
          .expect(201);

        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("Movie added to watchlist successfully");
        expect(res.body.data.watchlistEntry.status).toBe("want");
        expect(res.body.data.watchlistEntry.movie.id).toBe(testMovie1.id);

        watchlistEntry1 = res.body.data.watchlistEntry;
      });

      it("should add movie with default status", async () => {
        const res = await request(app)
          .post("/api/watchlist")
          .set("Authorization", `Bearer ${authToken2}`)
          .send({ movieId: testMovie2.id })
          .expect(201);

        expect(res.body.success).toBe(true);
        expect(res.body.data.watchlistEntry.status).toBe("want");

        watchlistEntry2 = res.body.data.watchlistEntry;
      });

      it("should fail without authentication token", async () => {
        const res = await request(app)
          .post("/api/watchlist")
          .send({ movieId: testMovie1.id, status: "want" })
          .expect(401);

        expect(res.body.success).toBe(false);
      });

      it("should fail with missing movieId", async () => {
        const res = await request(app)
          .post("/api/watchlist")
          .set("Authorization", `Bearer ${authToken1}`)
          .send({ status: "want" })
          .expect(400);

        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("Movie ID is required");
      });

      it("should fail with invalid movieId", async () => {
        const res = await request(app)
          .post("/api/watchlist")
          .set("Authorization", `Bearer ${authToken1}`)
          .send({ movieId: 99999, status: "want" })
          .expect(404);

        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("Movie not found");
      });

      it("should fail with invalid status", async () => {
        const res = await request(app)
          .post("/api/watchlist")
          .set("Authorization", `Bearer ${authToken1}`)
          .send({ movieId: testMovie3.id, status: "invalid_status" })
          .expect(400);

        expect(res.body.success).toBe(false);
      });

      it("should fail to add duplicate movie", async () => {
        const res = await request(app)
          .post("/api/watchlist")
          .set("Authorization", `Bearer ${authToken1}`)
          .send({ movieId: testMovie1.id, status: "want" })
          .expect(400);

        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("Movie is already in your watchlist");
      });
    });

    describe("GET /api/watchlist", () => {
      it("should get user watchlist successfully", async () => {
        const res = await request(app)
          .get("/api/watchlist")
          .set("Authorization", `Bearer ${authToken1}`)
          .expect(200);

        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("Watchlist retrieved successfully");
        expect(res.body.data.watchlist).toBeInstanceOf(Array);
        expect(res.body.data.pagination).toBeDefined();
        expect(res.body.data.watchlist.length).toBeGreaterThan(0);
      });

      it("should filter watchlist by status", async () => {
        // Add another entry with different status
        await request(app)
          .post("/api/watchlist")
          .set("Authorization", `Bearer ${authToken1}`)
          .send({ movieId: testMovie3.id, status: "watched" });

        const res = await request(app)
          .get("/api/watchlist?status=watched")
          .set("Authorization", `Bearer ${authToken1}`)
          .expect(200);

        expect(res.body.success).toBe(true);
        expect(res.body.data.filters.status).toBe("watched");
        expect(
          res.body.data.watchlist.every((entry) => entry.status === "watched")
        ).toBe(true);
      });

      it("should handle pagination", async () => {
        const res = await request(app)
          .get("/api/watchlist?page=1&limit=1")
          .set("Authorization", `Bearer ${authToken1}`)
          .expect(200);

        expect(res.body.success).toBe(true);
        expect(res.body.data.pagination.currentPage).toBe(1);
        expect(res.body.data.watchlist.length).toBeLessThanOrEqual(1);
      });

      it("should get empty watchlist for new user", async () => {
        // Create a new user with no watchlist
        const newUser = await User.create({
          username: "emptyuser",
          email: "emptyuser@example.com",
          password: "password123",
          favorite_genres: [],
        });
        const newToken = generateToken(newUser);

        const res = await request(app)
          .get("/api/watchlist")
          .set("Authorization", `Bearer ${newToken}`)
          .expect(200);

        expect(res.body.success).toBe(true);
        expect(res.body.data.watchlist.length).toBe(0);

        // Cleanup
        await User.destroy({ where: { id: newUser.id } });
      });

      it("should fail without authentication token", async () => {
        const res = await request(app).get("/api/watchlist").expect(401);

        expect(res.body.success).toBe(false);
      });
    });

    describe("PATCH /api/watchlist/:id", () => {
      it("should update watchlist entry successfully", async () => {
        const res = await request(app)
          .patch(`/api/watchlist/${watchlistEntry1.id}`)
          .set("Authorization", `Bearer ${authToken1}`)
          .send({ status: "watched" })
          .expect(200);

        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("Watchlist entry updated successfully");
        expect(res.body.data.watchlistEntry.status).toBe("watched");
      });

      it("should fail without authentication token", async () => {
        const res = await request(app)
          .patch(`/api/watchlist/${watchlistEntry1.id}`)
          .send({ status: "watched" })
          .expect(401);

        expect(res.body.success).toBe(false);
      });

      it("should fail with missing status", async () => {
        const res = await request(app)
          .patch(`/api/watchlist/${watchlistEntry1.id}`)
          .set("Authorization", `Bearer ${authToken1}`)
          .send({})
          .expect(400);

        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("Status is required");
      });

      it("should fail with invalid status", async () => {
        const res = await request(app)
          .patch(`/api/watchlist/${watchlistEntry1.id}`)
          .set("Authorization", `Bearer ${authToken1}`)
          .send({ status: "invalid_status" })
          .expect(400);

        expect(res.body.success).toBe(false);
      });

      it("should fail to update another user's entry", async () => {
        const res = await request(app)
          .patch(`/api/watchlist/${watchlistEntry1.id}`)
          .set("Authorization", `Bearer ${authToken2}`)
          .send({ status: "watched" })
          .expect(404);

        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("Watchlist entry not found");
      });

      it("should fail to update non-existent entry", async () => {
        const res = await request(app)
          .patch("/api/watchlist/99999")
          .set("Authorization", `Bearer ${authToken1}`)
          .send({ status: "watched" })
          .expect(404);

        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("Watchlist entry not found");
      });
    });

    describe("DELETE /api/watchlist/:id", () => {
      it("should remove movie from watchlist successfully", async () => {
        const res = await request(app)
          .delete(`/api/watchlist/${watchlistEntry1.id}`)
          .set("Authorization", `Bearer ${authToken1}`)
          .expect(200);

        expect(res.body.success).toBe(true);
        expect(res.body.message).toContain(
          "removed from watchlist successfully"
        );
      });

      it("should fail without authentication token", async () => {
        const res = await request(app)
          .delete(`/api/watchlist/${watchlistEntry2.id}`)
          .expect(401);

        expect(res.body.success).toBe(false);
      });

      it("should fail to remove another user's entry", async () => {
        const res = await request(app)
          .delete(`/api/watchlist/${watchlistEntry2.id}`)
          .set("Authorization", `Bearer ${authToken1}`)
          .expect(404);

        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("Watchlist entry not found");
      });

      it("should fail to remove non-existent entry", async () => {
        const res = await request(app)
          .delete("/api/watchlist/99999")
          .set("Authorization", `Bearer ${authToken1}`)
          .expect(404);

        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("Watchlist entry not found");
      });
    });
  });

  // General API Tests
  describe("General API", () => {
    describe("GET /api/", () => {
      it("should return welcome message", async () => {
        const res = await request(app).get("/api/").expect(200);

        expect(res.text).toContain("Welcome to the Movie Recommendation API");
      });
    });

    describe("Error Handling", () => {
      it("should return 404 for unknown API route", async () => {
        const res = await request(app).get("/api/unknown").expect(404);

        expect(res.body.success).toBe(undefined);
      });

      it("should return 404 for unknown route", async () => {
        const res = await request(app).get("/unknown").expect(404);
      });

      it("should handle malformed JSON requests", async () => {
        const res = await request(app)
          .post("/api/auth/register")
          .send("malformed json")
          .set("Content-Type", "application/json")
          .expect(400);
      });

      it("should handle missing Authorization header", async () => {
        const res = await request(app).get("/api/watchlist").expect(401);

        expect(res.body.success).toBe(false);
      });

      it("should handle Authorization header without Bearer prefix", async () => {
        const res = await request(app)
          .get("/api/watchlist")
          .set("Authorization", authToken1)
          .expect(401);

        expect(res.body.success).toBe(false);
      });

      it("should handle empty Authorization header", async () => {
        const res = await request(app)
          .get("/api/watchlist")
          .set("Authorization", "")
          .expect(401);

        expect(res.body.success).toBe(false);
      });
    });
  });
});
