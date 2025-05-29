import React, { useState, useEffect, useCallback } from "react";
import axios from "../lib/http";
import Swal from "sweetalert2";
import { useNavigate } from "react-router";

const WatchlistCard = ({ movie, onWatched, onFavorite, onRemove }) => {
  const navigate = useNavigate();

  // Handle both direct movie object and nested movie object
  const movieData = movie.movie || movie;
  const posterUrl = movieData.coverUrl;
  const releaseYear = movieData.release_date
    ? new Date(movieData.release_date).getFullYear()
    : "Unknown";
  const rating = movieData.vote_average
    ? movieData.vote_average.toFixed(1)
    : "N/A";
  const movieGenres = movieData.genres || movieData.Genres || [];
  const genreNames = movieGenres.map((genre) => genre.name).join(", ");

  const handleViewDetails = () => {
    navigate(`/moviedetails/${movieData.id}`);
  };

  return (
    <div className="col-lg-3 col-md-4 col-sm-6 mb-4">
      <div className="card h-100 shadow-sm movie-card">
        <img
          src={posterUrl}
          className="card-img-top"
          alt={movieData.title || "Movie poster"}
          style={{ height: "300px", objectFit: "cover" }}
          onError={(e) => {
            e.target.src =
              "https://via.placeholder.com/200x300.png?text=No+Poster";
          }}
        />
        <div className="card-body d-flex flex-column">
          <h6 className="card-title text-truncate" title={movieData.title}>
            {movieData.title || "Unknown Title"}
          </h6>
          <div className="mt-auto">
            <p className="card-text small text-muted mb-1">
              <i className="bi bi-calendar me-1"></i>
              Released: {releaseYear}
            </p>
            {/* <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="badge bg-warning text-dark">
                <i className="bi bi-star-fill me-1"></i>
                {rating}
              </span>
            </div> */}
            {movieGenres.length > 0 && (
              <div className="mb-2">
                <small className="text-muted d-block">
                  <i className="bi bi-tags me-1"></i>
                  {genreNames || "N/A"}
                </small>
              </div>
            )}
          </div>
        </div>
        <div className="card-footer bg-transparent border-top-0 p-2">
          <div className="d-grid gap-1">
            <button
              className="btn btn-primary btn-sm"
              onClick={handleViewDetails}
            >
              <i className="bi bi-info-circle me-1"></i>
              View Details
            </button>
            <div className="d-flex gap-1">
              <button
                className="btn btn-success btn-sm flex-fill"
                onClick={() => onWatched(movieData.id)}
                title="Mark as watched"
              >
                <i className="bi bi-check-circle me-1"></i>
                Watched
              </button>
              <button
                className="btn btn-warning btn-sm flex-fill"
                onClick={() => onFavorite(movieData.id)}
                title="Mark as favorite"
              >
                <i className="bi bi-heart-fill me-1"></i>
                Favorite
              </button>
            </div>
            <button
              className="btn btn-outline-danger btn-sm"
              onClick={() => onRemove(movie.id)} // Use movie.id (watchlist entry ID) instead of movieData.id (movie ID)
              title="Remove from watchlist"
            >
              <i className="bi bi-trash me-1"></i>
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Watchlist = () => {
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalItems: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const fetchWatchlist = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `/watchlist?page=${currentPage}&limit=20`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      if (data.success) {
        // Handle different possible response structures
        const watchlistData =
          data.data?.watchlist || data.data || data.watchlist || [];
        setWatchlist(watchlistData);

        // Handle pagination
        const paginationData = data.data?.pagination ||
          data.pagination || {
            currentPage: 1,
            totalPages: 1,
            totalItems: watchlistData.length,
            hasNextPage: false,
            hasPrevPage: false,
          };

        setPagination(paginationData);
        setTotalPages(paginationData.totalPages || 1);
      } else {
        console.error("API returned success: false", data);
        setWatchlist([]);
      }
    } catch (error) {
      console.error("Error fetching watchlist:", error);
      console.error("Error response:", error.response?.data);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Failed to fetch watchlist",
      });

      setWatchlist([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchWatchlist();
  }, [fetchWatchlist]);

  const handleWatched = async (movieId) => {
    try {
      const result = await Swal.fire({
        title: "Mark as Watched?",
        text: "This will mark the movie as watched in your watchlist.",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#28a745",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Yes, mark as watched!",
      });

      if (result.isConfirmed) {
        // You can implement the watched functionality here
        // For now, just show a success message
        Swal.fire({
          icon: "success",
          title: "Marked as Watched!",
          text: "Movie has been marked as watched.",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      console.error("Error marking as watched:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to mark movie as watched",
      });
    }
  };

  const handleFavorite = async (movieId) => {
    try {
      const result = await Swal.fire({
        title: "Mark as Favorite?",
        text: "This will add the movie to your favorites.",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#ffc107",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Yes, add to favorites!",
      });

      if (result.isConfirmed) {
        // You can implement the favorite functionality here
        // For now, just show a success message
        Swal.fire({
          icon: "success",
          title: "Added to Favorites!",
          text: "Movie has been added to your favorites.",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      console.error("Error adding to favorites:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to add movie to favorites",
      });
    }
  };

  const handleRemove = async (movieId) => {
    try {
      const result = await Swal.fire({
        title: "Remove from Watchlist?",
        text: "This will remove the movie from your watchlist.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#dc3545",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Yes, remove it!",
      });

      if (result.isConfirmed) {
        await axios.delete(`/watchlist/${movieId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });

        // Refresh the watchlist
        fetchWatchlist();

        Swal.fire({
          icon: "success",
          title: "Removed!",
          text: "Movie has been removed from your watchlist.",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      console.error("Error removing from watchlist:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error.response?.data?.message ||
          "Failed to remove movie from watchlist",
      });
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="container mt-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="fw-bold mb-2">
                <i className="bi bi-bookmark-heart me-2 text-primary"></i>
                My Watchlist
              </h1>
              <p className="text-muted mb-0">
                {watchlist.length > 0
                  ? `Showing ${watchlist.length} movies in your watchlist`
                  : "Your watchlist is empty"}
              </p>
            </div>
            <button
              className="btn btn-outline-primary"
              onClick={fetchWatchlist}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                  ></span>
                  Loading...
                </>
              ) : (
                <>
                  <i className="bi bi-arrow-clockwise me-1"></i>
                  Refresh
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Loading Spinner */}
      {loading && (
        <div className="row">
          <div className="col-12 text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-muted">Loading your watchlist...</p>
          </div>
        </div>
      )}

      {/* Watchlist Content */}
      {!loading && (
        <>
          {watchlist.length > 0 ? (
            <>
              {/* Movies Grid */}
              <div className="row">
                {watchlist.map((item, index) => (
                  <WatchlistCard
                    key={item.id || item.Movie?.id || index}
                    movie={item}
                    onWatched={handleWatched}
                    onFavorite={handleFavorite}
                    onRemove={handleRemove}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="row mt-5">
                  <div className="col-12">
                    <nav aria-label="Watchlist pagination">
                      <ul className="pagination pagination-lg justify-content-center">
                        <li
                          className={`page-item ${
                            !pagination.hasPrevPage ? "disabled" : ""
                          }`}
                        >
                          <button
                            className="page-link"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={!pagination.hasPrevPage}
                          >
                            <i className="bi bi-chevron-left"></i>
                            Previous
                          </button>
                        </li>

                        {/* Page numbers */}
                        {[...Array(Math.min(5, totalPages))].map((_, index) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = index + 1;
                          } else if (currentPage <= 3) {
                            pageNum = index + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + index;
                          } else {
                            pageNum = currentPage - 2 + index;
                          }

                          return (
                            <li
                              key={pageNum}
                              className={`page-item ${
                                currentPage === pageNum ? "active" : ""
                              }`}
                            >
                              <button
                                className="page-link"
                                onClick={() => handlePageChange(pageNum)}
                              >
                                {pageNum}
                              </button>
                            </li>
                          );
                        })}

                        <li
                          className={`page-item ${
                            !pagination.hasNextPage ? "disabled" : ""
                          }`}
                        >
                          <button
                            className="page-link"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={!pagination.hasNextPage}
                          >
                            Next
                            <i className="bi bi-chevron-right"></i>
                          </button>
                        </li>
                      </ul>
                    </nav>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Empty State */
            <div className="row">
              <div className="col-12 text-center py-5">
                <i className="bi bi-bookmark-x display-1 text-muted mb-3"></i>
                <h3 className="text-muted mb-3">Your watchlist is empty</h3>
                <p className="text-muted mb-4">
                  Start adding movies to your watchlist to keep track of what
                  you want to watch!
                </p>
                <a href="/" className="btn btn-primary">
                  <i className="bi bi-film me-1"></i>
                  Browse Movies
                </a>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Watchlist;
