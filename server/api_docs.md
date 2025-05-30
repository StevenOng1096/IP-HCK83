# Movie Recommendation API Documentation

## Base URL

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

---

## Authentication Endpoints

### 1. Register User

**POST** `/auth/register`

**Description:** Register a new user account

**Request Body:**

```json
{
  "username": "string (required)",
  "email": "string (required)",
  "password": "string (required)",
  "favorite_genres": "array of integers (optional)"
}
```

**Response (201):**
{
"success": true,
"message": "User registered successfully",
"data": {
"user": {
"id": 1,
"username": "john_doe",
"email": "john@example.com",
"favorite_genres": [1, 2, 3]
},
"token": "jwt_token_here"
}
}

**Error Response (400):**
{
message: "Missing required fields or user already exists"
}

**Error Response (500):**
{
message: "Server Error"
}

### 2. Login User

**POST** `/auth/login`

**Description:** Log in a user and receive a JWT token

**Request Body:**

```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**Response (200):**
{
"success": true,
"message": "Login successful",
"data": {
"user": {
"id": 1,
"username": "john_doe",
"email": "john@example.com",
"favorite_genres": [1, 2, 3]
},
"token": "jwt_token_here"
},
"access_token": "jwt_token_here",
"email": "john@example.com"
}

**Error Response (400):**
{
"message": "Missing email or password"
}

**error Response (401):**
{
"message": "Invalid credentials"
}

**error Response (500):**
{
"message": "Server Error"
}

### 3. Google Login

**POST** `/auth/google-login`

**Description:** Log in a user using Google OAuth2

**Request Body:**

```json
{
  "id_token": "string (required)"
}
```

**Response (200):**
{
"success": true,
"message": "Google login successful",
"data": {
"user": {
"id": 1,
"username": "john_doe",
"email": "john@example.com",
"favorite_genres": []
},
"token": "jwt_token_here"
},
"access_token": "jwt_token_here",
"email": "john@example.com"
}

**Error Response (400):**
{
"message": "Missing Google ID token"
}

**Error Response (500):**
{
"message": "Server Error"
}

### 4. Get User Profile

**GET** `/auth/profile`

**Description:** Get the user's profile information

**Headers:**

```
Authorization: Bearer <JWT Token>
```

**Response (200):**
{
"success": true,
"message": "Profile retrieved successfully",
"data": {
"user": {
"id": 1,
"username": "john_doe",
"email": "john@example.com",
"favorite_genres": [1, 2, 3]
}
}
}

**Error Response (401):**
{
"message": "Invalid or missing token"
}

**Error Response (500):**
{
"message": "Server Error"
}

### 5. Update User Profile

**PUT** `/auth/profile`

**Description:** Update the user's profile information

**Headers:**

```
Authorization: Bearer <JWT Token>
```

**Request Body:**

```json
{
  "username": "string (optional)",
  "favorite_genres": "array of integers (optional)"
}
```

**Response (200):**
{
"success": true,
"message": "Profile updated successfully",
"data": {
"user": {
"id": 1,
"username": "updated_username",
"email": "john@example.com",
"favorite_genres": [1, 2, 3, 4]
}
}
}

**error Response (400):**
{
"message": "Invalid data format"
}

**error Response (401):**
{
"message": "Invalid or missing token"
}

**error Response (500):**
{
"message": "Server Error"
}

### 6. Get All Movie

**GET** `/movies`

**Description:** Get a list of all movies

Query Parameters:

```
page: integer (optional) - Page number (default: 1)
limit: integer (optional) - Number of movies per page (default: 20)
genre: integer (optional) - Filter movies by genre name
search: string (optional) - Search movies by title
year: integer (optional) - Filter movies by release year
sort: string (optional) - Sort movies by title or release_date or popularity or createdAt
```

**Response (200):**
{
"success": true,
"message": "Movies retrieved successfully",
"data": {
"movies": [
{
"id": 1,
"title": "Movie Title",
"overview": "Movie description",
"coverUrl": "https://image.url",
"release_date": "2023-01-01T00:00:00.000Z",
"createdAt": "2023-01-01T00:00:00.000Z",
"watchlistCount": 5,
"genres": [
{
"id": 1,
"name": "Action"
}
]
}
],
"pagination": {
"currentPage": 1,
"totalPages": 10,
"totalMovies": 200,
"hasNextPage": true,
"hasPrevPage": false
},
"filters": {
"genre": "Action",
"search": "Batman",
"year": "2022",
"sort": "popularity"
}
}
}

**Error Response (500):**
{
"message": "Server Error"
}

### 7. Get Movie by ID

**GET** `/movies/:id`

**Description:** Get details of a specific movie by ID

parameters:

```
id: integer (required) - Movie ID
```

**Response (200):**

```
{
  "success": true,
  "message": "Movie retrieved successfully",
  "data": {
    "movie": {
      "id": 1,
      "title": "Movie Title",
      "overview": "Detailed movie description",
      "coverUrl": "https://image.url",
      "release_date": "2023-01-01T00:00:00.000Z",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "watchlistCount": 5,
      "genres": [
        {
          "id": 1,
          "name": "Action"
        },
        {
          "id": 2,
          "name": "Thriller"
        }
      ]
    }
  }
}
```

**Error Response (404):**
{
"message": "Movie not found"
}

**Error Response (500):**
{
"message": "Server Error"
}

### 8. Get AI Movie Recommendations

**GET** `/movies/recommendations/ai`

**Description:** Get AI movie recommendations based on user preferences

**Headers:**

```
Authorization: Bearer <JWT Token>
```

**Response (200):**

```
{
  "message": "Hello from Gemini API",
  "generation": [1, 5, 10],
  "movies": [
    {
      "id": 1,
      "title": "Recommended Movie 1",
      "overview": "Movie description",
      "coverUrl": "https://image.url",
      "release_date": "2023-01-01T00:00:00.000Z"
    }
  ]
}
```

**Error Response (401):**
{
"message": "Invalid or missing token"
}

**Error Response (500):**
{
"message": "Failed to generate AI recommendations"
}

### 9. Get User Watchlist

**GET** `/watchlist`

**Description:** Get the user's watchlist

**Headers:**

```
Authorization: Bearer <JWT Token>
```

**Response (200):**

```
{
  "success": true,
  "message": "Watchlist retrieved successfully",
  "data": {
    "watchlist": [
      {
        "id": 1,
        "status": "want",
        "createdAt": "2023-01-01T00:00:00.000Z",
        "updatedAt": "2023-01-01T00:00:00.000Z",
        "movie": {
          "id": 1,
          "title": "Movie Title",
          "overview": "Movie description",
          "coverUrl": "https://image.url",
          "release_date": "2023-01-01T00:00:00.000Z",
          "genres": [
            {
              "id": 1,
              "name": "Action"
            }
          ]
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 50,
      "hasNextPage": true,
      "hasPrevPage": false
    },
    "filters": {
      "status": "want"
    }
  }
}
```

**error Response (401):**
{
"message": "Invalid or missing token"
}

**error Response (500):**
{
"message": "Server Error"
}

### 10. Add Movie to Watchlist

**POST** `/watchlist`

**Description:** Add a movie to the user's watchlist

**Headers:**

```
Authorization: Bearer <JWT Token>
```

**Request Body:**
{
"movieId": "integer (required)",
"status": "string (optional, default: 'want')"
}

**Response (201):**
{
"success": true,
"message": "Movie added to watchlist successfully",
"data": {
"watchlistEntry": {
"id": 1,
"status": "want",
"createdAt": "2023-01-01T00:00:00.000Z",
"updatedAt": "2023-01-01T00:00:00.000Z",
"movie": {
"id": 1,
"title": "Movie Title",
"overview": "Movie description",
"coverUrl": "https://image.url",
"release_date": "2023-01-01T00:00:00.000Z",
"genres": [
{
"id": 1,
"name": "Action"
}
]
}
}
}
}

**Error Response (400):**
{
"message": "Missing movieId, invalid status, or movie already exists in watchlist"
}

**Error Response (401):**
{
"message": "Invalid or missing token"
}

**Error Response (404)**
{
"message": "Movie not found"
}

**Error Response (500):**
{
"message": "Server Error"
}

### 11. Update Watchlist Entry

**PATCH** `/watchlist/:id`

**Description:** Update the status of a movie in the user's watchlist
**Headers:**

```
Authorization: Bearer <JWT Token>
```

params:

```
id: integer (required) - Watchlist entry ID
```

**Request Body:**
{
"status": "string (required)"
}

**Response (200):**
{
"success": true,
"message": "Watchlist entry updated successfully",
"data": {
"watchlistEntry": {
"id": 1,
"status": "watched",
"createdAt": "2023-01-01T00:00:00.000Z",
"updatedAt": "2023-01-01T00:00:00.000Z",
"movie": {
"id": 1,
"title": "Movie Title",
"overview": "Movie description",
"coverUrl": "https://image.url",
"release_date": "2023-01-01T00:00:00.000Z",
"genres": [
{
"id": 1,
"name": "Action"
}
]
}
}
}
}

**Error Response (400):**
{
"message": "Missing or invalid status"
}

**Error Response (401):**
{
"message": "Invalid or missing token"
}

**Error Response (404):**
{
"message": "Watchlist entry not found"
}

**Error Response (500):**
{
"message": "Server Error"
}

### 12. Remove Movie From Watchlist

**DELETE** `/watchlist/:id`

**Description:** Remove a movie from the user's watchlist

**Headers:**

```
Authorization: Bearer <JWT Token>
```

params:

```
id: integer (required) - Watchlist entry ID
```

**Response (200):**
{
"success": true,
"message": "\"Movie Title\" removed from watchlist successfully"
}

**Error Response (401):**
{
"message": "Invalid or missing token"
}

**Error Response (404):**
{
"message": "Watchlist entry not found"
}

**Error Response (500):**
{
"message": "Server Error"
}

### GENERAL API

address/api/
**Response (200):**
{
message: "Welcome to Movie Watchlist API"
}
