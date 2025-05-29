import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import Swal from "sweetalert2";

const MovieDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingToWatchlist, setAddingToWatchlist] = useState(false);

  useEffect(() => {
    fetchMovieDetail();
  }, [id]);

  const fetchMovieDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("access_token");
      const response = await fetch(`http://localhost:3000/api/movies/${id}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch movie details");
      }

      const data = await response.json();
      if (data.success) {
        setMovie(data.data.movie);
      } else {
        throw new Error(data.message || "Failed to fetch movie details");
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching movie details:", err);
    } finally {
      setLoading(false);
    }
  };

  const addToWatchlist = async () => {
    try {
      setAddingToWatchlist(true);
      const token = localStorage.getItem("access_token");

      const response = await fetch("http://localhost:3000/api/watchlist/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ movieId: movie.id }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        Swal.fire({
          icon: "success",
          title: "Added to Watchlist!",
          text: "Movie has been added to your watchlist.",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        throw new Error(data.message || "Failed to add to watchlist");
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "Failed to add movie to watchlist",
      });
    } finally {
      setAddingToWatchlist(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="d-flex justify-content-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Error!</h4>
          <p>{error}</p>
          <hr />
          <button
            className="btn btn-outline-danger"
            onClick={() => navigate("/")}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="container mt-4">
        <div className="alert alert-warning" role="alert">
          Movie not found.
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      {/* Back Button */}
      <div className="mb-3">
        <button
          className="btn btn-outline-secondary"
          onClick={() => navigate(-1)}
        >
          <i className="bi bi-arrow-left"></i> Back
        </button>
      </div>

      <div className="row">
        {/* Movie Poster */}
        <div className="col-md-4 mb-4">
          <div className="card">
            <img
              src={movie.coverUrl}
              className="card-img-top"
              alt={movie.title}
              style={{ height: "600px", objectFit: "cover" }}
              onError={(e) => {
                e.target.src =
                  "https://via.placeholder.com/500x750?text=No+Image";
              }}
            />
          </div>
        </div>

        {/* Movie Details */}
        <div className="col-md-8">
          <div className="card">
            <div className="card-body">
              {/* Title */}
              <h1 className="card-title mb-3">{movie.title}</h1>

              {/* Genres */}
              <div className="mb-3">
                <h6 className="text-muted mb-2">Genres:</h6>
                <div>
                  {movie.genres && movie.genres.length > 0 ? (
                    movie.genres.map((genre, index) => (
                      <span
                        key={genre.id}
                        className="badge bg-primary me-2 mb-1"
                      >
                        {genre.name}
                      </span>
                    ))
                  ) : (
                    <span className="badge bg-secondary">N/A</span>
                  )}
                </div>
              </div>

              {/* Release Date */}
              <div className="mb-3">
                <h6 className="text-muted mb-1">Release Date:</h6>
                <p className="mb-0">{formatDate(movie.release_date)}</p>
              </div>

              {/* Watchlist Count */}
              <div className="mb-3">
                <h6 className="text-muted mb-1">Watchlist Count:</h6>
                <p className="mb-0">
                  <span className="badge bg-info">
                    {movie.watchlistCount} users
                  </span>
                </p>
              </div>

              {/* Overview */}
              <div className="mb-4">
                <h6 className="text-muted mb-2">Overview:</h6>
                <p className="card-text">{movie.overview}</p>
              </div>

              {/* Action Buttons */}
              <div className="d-flex gap-2">
                <button
                  className="btn btn-primary"
                  onClick={addToWatchlist}
                  disabled={addingToWatchlist}
                >
                  {addingToWatchlist ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                      ></span>
                      Adding...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-plus-circle me-2"></i>
                      Add to Watchlist
                    </>
                  )}
                </button>

                <button
                  className="btn btn-outline-secondary"
                  onClick={() => navigate("/")}
                >
                  <i className="bi bi-house me-2"></i>
                  Back to Home
                </button>
              </div>
            </div>
          </div>

          {/* Additional Info Card */}
          <div className="card mt-3">
            <div className="card-body">
              <h6 className="card-title">Additional Information</h6>
              <div className="row">
                <div className="col-sm-6">
                  <small className="text-muted">Movie ID:</small>
                  <p className="mb-1">{movie.id}</p>
                </div>
                <div className="col-sm-6">
                  <small className="text-muted">Added to Database:</small>
                  <p className="mb-1">{formatDate(movie.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetail;
