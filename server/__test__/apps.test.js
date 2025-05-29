// Set test environment before anything else
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

describe("Movie Recommendation API Integration", () => {
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
  describe("Auth Endpoints", () => {
    it("registers a new user", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({
          username: "registertest",
          email: "registertest@example.com",
          password: "password123",
          favorite_genres: [testGenre1.id],
        })
        .expect(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.username).toBe("registertest");
      await User.destroy({ where: { email: "registertest@example.com" } });
    });
    it("fails to register with missing fields", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ username: "incomplete" })
        .expect(400);
      expect(res.body.success).toBe(false);
    });
    it("fails to register with duplicate email", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ username: "dup", email: testUser1.email, password: "pass" })
        .expect(400);
      expect(res.body.success).toBe(false);
    });
    it("logs in with valid credentials", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: testUser1.email, password: "password123" })
        .expect(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
    });
    it("fails login with wrong password", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: testUser1.email, password: "wrong" })
        .expect(401);
      expect(res.body.success).toBe(false);
    });
    it("gets user profile with token", async () => {
      const res = await request(app)
        .get("/api/auth/profile")
        .set("Authorization", `Bearer ${authToken1}`)
        .expect(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.id).toBe(testUser1.id);
    });
    it("fails to get profile without token", async () => {
      const res = await request(app).get("/api/auth/profile").expect(401);
      expect(res.body.success).toBe(false);
    });
    it("updates user profile", async () => {
      const res = await request(app)
        .patch("/api/auth/profile")
        .set("Authorization", `Bearer ${authToken1}`)
        .send({ username: "updateduser1" })
        .expect(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.username).toBe("updateduser1");
    });
    it("fails to update with duplicate username", async () => {
      const res = await request(app)
        .patch("/api/auth/profile")
        .set("Authorization", `Bearer ${authToken1}`)
        .send({ username: testUser2.username })
        .expect(400);
      expect(res.body.success).toBe(false);
    });

    // Additional edge cases for auth
    it("fails register with invalid favorite_genres", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({
          username: "testinvalid",
          email: "testinvalid@example.com",
          password: "password123",
          favorite_genres: ["invalid"], // Invalid genre ID format
        })
        .expect(400);
    });

    it("fails login with non-existent email", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "nonexistent@example.com", password: "password123" })
        .expect(401);
      expect(res.body.success).toBe(false);
    });

    it("fails profile update with invalid token", async () => {
      const res = await request(app)
        .patch("/api/auth/profile")
        .set("Authorization", "Bearer invalidtoken")
        .send({ username: "shouldfail" })
        .expect(401);
    });
    it("updates profile with favorite_genres", async () => {
      const res = await request(app)
        .patch("/api/auth/profile")
        .set("Authorization", `Bearer ${authToken1}`)
        .send({ favorite_genres: [testGenre2.id, testGenre3.id] })
        .expect(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.favorite_genres).toContain(testGenre2.id);
    });

    it("fails to update profile with invalid favorite_genres", async () => {
      const res = await request(app)
        .patch("/api/auth/profile")
        .set("Authorization", `Bearer ${authToken1}`)
        .send({ favorite_genres: [99999] })
        .expect(400);
      expect(res.body.success).toBe(false);
    });

    it("fails to access profile with malformed token", async () => {
      const res = await request(app)
        .get("/api/auth/profile")
        .set("Authorization", "Bearer invalid_token")
        .expect(401);
      expect(res.body.success).toBe(false);
    });

    it("fails to access profile with expired token", async () => {
      const res = await request(app)
        .get("/api/auth/profile")
        .set(
          "Authorization",
          "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwiaWF0IjoxNjA5NDU5MjAwLCJleHAiOjE2MDk0NjI4MDB9.invalid"
        )
        .expect(401);
      expect(res.body.success).toBe(false);
    });
  });
  describe("Movie Endpoints", () => {
    it("gets all movies", async () => {
      const res = await request(app).get("/api/movies").expect(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.movies.length).toBeGreaterThan(0);
    });
    it("filters movies by genre", async () => {
      const res = await request(app)
        .get("/api/movies?genre=Action")
        .expect(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.movies[0].genres[0].name).toBe("Action");
    });
    it("gets a movie by id", async () => {
      const res = await request(app)
        .get(`/api/movies/${testMovie1.id}`)
        .expect(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.movie.id).toBe(testMovie1.id);
    });
    it("returns 404 for non-existent movie", async () => {
      const res = await request(app).get("/api/movies/99999").expect(404);
      expect(res.body.success).toBe(false);
    });
    it("gets AI recommendations (requires token)", async () => {
      const res = await request(app)
        .get("/api/movies/recommendations/ai")
        .set("Authorization", `Bearer ${authToken1}`)
        .expect(200);
      expect(res.body.success).toBe(true);
    });
    it("fails AI recommendations without token", async () => {
      const res = await request(app)
        .get("/api/movies/recommendations/ai")
        .expect(401);
      expect(res.body.success).toBe(false);
    });

    // Additional movie endpoint tests
    it("searches movies by title", async () => {
      const res = await request(app)
        .get("/api/movies?search=Action")
        .expect(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.movies.length).toBeGreaterThan(0);
    });

    it("filters movies by year", async () => {
      const res = await request(app).get("/api/movies?year=2023").expect(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.movies.length).toBeGreaterThan(0);
    });

    it("sorts movies by title", async () => {
      const res = await request(app).get("/api/movies?sort=title").expect(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.movies.length).toBeGreaterThan(0);
    });

    it("sorts movies by release_date", async () => {
      const res = await request(app)
        .get("/api/movies?sort=release_date")
        .expect(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.movies.length).toBeGreaterThan(0);
    });

    it("sorts movies by popularity", async () => {
      const res = await request(app)
        .get("/api/movies?sort=popularity")
        .expect(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.movies.length).toBeGreaterThan(0);
    });

    it("handles pagination for movies", async () => {
      const res = await request(app)
        .get("/api/movies?page=1&limit=2")
        .expect(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.pagination.currentPage).toBe(1);
      expect(res.body.data.movies.length).toBeLessThanOrEqual(2);
    });

    it("handles invalid movie ID gracefully", async () => {
      const res = await request(app).get("/api/movies/invalid").expect(404);
      expect(res.body.success).toBe(false);
    });
    it("gets movie with watchlist count", async () => {
      const res = await request(app)
        .get(`/api/movies/${testMovie1.id}`)
        .expect(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.movie).toHaveProperty("watchlistCount");
    });

    it("handles multiple query parameters", async () => {
      const res = await request(app)
        .get("/api/movies?genre=Action&year=2023&sort=title&page=1&limit=5")
        .expect(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.pagination.currentPage).toBe(1);
    });

    it("handles empty search results", async () => {
      const res = await request(app)
        .get("/api/movies?search=NonExistentMovieTitle123")
        .expect(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.movies.length).toBe(0);
    });

    it("fails AI recommendations with invalid token", async () => {
      const res = await request(app)
        .get("/api/movies/recommendations/ai")
        .set("Authorization", "Bearer invalid_token")
        .expect(401);
      expect(res.body.success).toBe(false);
    });
  });
  describe("Watchlist Endpoints", () => {
    it("adds movie to watchlist", async () => {
      const res = await request(app)
        .post("/api/watchlist")
        .set("Authorization", `Bearer ${authToken1}`)
        .send({ movieId: testMovie1.id, status: "want" })
        .expect(201);
      expect(res.body.success).toBe(true);
      watchlistEntry1 = res.body.data.watchlistEntry;
    });

    it("fails to add movie to watchlist without authentication", async () => {
      const res = await request(app)
        .post("/api/watchlist")
        .send({ movieId: testMovie1.id, status: "want" })
        .expect(401);
      expect(res.body.success).toBe(false);
    });

    it("fails to add movie to watchlist with invalid movieId", async () => {
      const res = await request(app)
        .post("/api/watchlist")
        .set("Authorization", `Bearer ${authToken1}`)
        .send({ movieId: 99999, status: "want" })
        .expect(404);
      expect(res.body.success).toBe(false);
    });

    it("fails to add movie to watchlist with invalid status", async () => {
      const res = await request(app)
        .post("/api/watchlist")
        .set("Authorization", `Bearer ${authToken1}`)
        .send({ movieId: testMovie2.id, status: "invalid_status" })
        .expect(400);
      expect(res.body.success).toBe(false);
    });

    it("fails to add duplicate movie to watchlist", async () => {
      await request(app)
        .post("/api/watchlist")
        .set("Authorization", `Bearer ${authToken1}`)
        .send({ movieId: testMovie2.id, status: "want" });
      const res = await request(app)
        .post("/api/watchlist")
        .set("Authorization", `Bearer ${authToken1}`)
        .send({ movieId: testMovie2.id, status: "want" })
        .expect(400);
      expect(res.body.success).toBe(false);
    });

    it("gets user watchlist", async () => {
      const res = await request(app)
        .get("/api/watchlist")
        .set("Authorization", `Bearer ${authToken1}`)
        .expect(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.watchlist.length).toBeGreaterThan(0);
    });

    it("gets empty watchlist for new user", async () => {
      const res = await request(app)
        .get("/api/watchlist")
        .set("Authorization", `Bearer ${authToken2}`)
        .expect(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.watchlist.length).toBe(0);
    });

    it("fails to get watchlist without authentication", async () => {
      const res = await request(app).get("/api/watchlist").expect(401);
      expect(res.body.success).toBe(false);
    });

    it("filters watchlist by status", async () => {
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
      expect(
        res.body.data.watchlist.every((entry) => entry.status === "watched")
      ).toBe(true);
    });

    it("updates watchlist entry", async () => {
      const res = await request(app)
        .patch(`/api/watchlist/${watchlistEntry1.id}`)
        .set("Authorization", `Bearer ${authToken1}`)
        .send({ status: "watched" })
        .expect(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.watchlistEntry.status).toBe("watched");
    });

    it("fails to update watchlist entry without authentication", async () => {
      const res = await request(app)
        .patch(`/api/watchlist/${watchlistEntry1.id}`)
        .send({ status: "watched" })
        .expect(401);
      expect(res.body.success).toBe(false);
    });

    it("fails to update watchlist entry with invalid status", async () => {
      const res = await request(app)
        .patch(`/api/watchlist/${watchlistEntry1.id}`)
        .set("Authorization", `Bearer ${authToken1}`)
        .send({ status: "invalid_status" })
        .expect(400);
      expect(res.body.success).toBe(false);
    });

    it("fails to update another user's watchlist entry", async () => {
      const res = await request(app)
        .patch(`/api/watchlist/${watchlistEntry1.id}`)
        .set("Authorization", `Bearer ${authToken2}`)
        .send({ status: "watched" })
        .expect(404);
      expect(res.body.success).toBe(false);
    });

    it("fails to update non-existent entry", async () => {
      const res = await request(app)
        .patch(`/api/watchlist/99999`)
        .set("Authorization", `Bearer ${authToken1}`)
        .send({ status: "watched" })
        .expect(404);
      expect(res.body.success).toBe(false);
    });

    it("removes movie from watchlist", async () => {
      const res = await request(app)
        .delete(`/api/watchlist/${watchlistEntry1.id}`)
        .set("Authorization", `Bearer ${authToken1}`)
        .expect(200);
      expect(res.body.success).toBe(true);
    });

    it("fails to remove movie from watchlist without authentication", async () => {
      // First add an entry to delete
      const addRes = await request(app)
        .post("/api/watchlist")
        .set("Authorization", `Bearer ${authToken1}`)
        .send({ movieId: testMovie1.id, status: "want" });

      const res = await request(app)
        .delete(`/api/watchlist/${addRes.body.data.watchlistEntry.id}`)
        .expect(401);
      expect(res.body.success).toBe(false);
    });

    it("fails to remove another user's watchlist entry", async () => {
      // First add an entry as user1
      const addRes = await request(app)
        .post("/api/watchlist")
        .set("Authorization", `Bearer ${authToken1}`)
        .send({ movieId: testMovie1.id, status: "want" });

      // Try to delete as user2
      const res = await request(app)
        .delete(`/api/watchlist/${addRes.body.data.watchlistEntry.id}`)
        .set("Authorization", `Bearer ${authToken2}`)
        .expect(404);
      expect(res.body.success).toBe(false);
    });

    it("fails to remove non-existent entry", async () => {
      const res = await request(app)
        .delete(`/api/watchlist/99999`)
        .set("Authorization", `Bearer ${authToken1}`)
        .expect(404);
      expect(res.body.success).toBe(false);
    });
  });
  describe("General API", () => {
    it("returns welcome message for root", async () => {
      const res = await request(app).get("/api/").expect(200);
      expect(res.text).toContain("Welcome to the Movie Recommendation API");
    });

    it("returns 404 for unknown API route", async () => {
      const res = await request(app).get("/api/unknown").expect(404);
      expect(res.body.success).toBe(false);
    });

    it("returns 404 for unknown route", async () => {
      const res = await request(app).get("/unknown").expect(404);
    });

    it("handles malformed JSON requests", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send("malformed json")
        .set("Content-Type", "application/json")
        .expect(400);
    });

    it("handles missing Authorization header", async () => {
      const res = await request(app).get("/api/watchlist").expect(401);
      expect(res.body.success).toBe(false);
    });

    it("handles Authorization header without Bearer prefix", async () => {
      const res = await request(app)
        .get("/api/watchlist")
        .set("Authorization", authToken1)
        .expect(401);
      expect(res.body.success).toBe(false);
    });

    it("handles empty Authorization header", async () => {
      const res = await request(app)
        .get("/api/watchlist")
        .set("Authorization", "")
        .expect(401);
      expect(res.body.success).toBe(false);
    });
  });
});
