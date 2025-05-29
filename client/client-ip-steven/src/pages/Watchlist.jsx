import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Swal from "sweetalert2";
import { useNavigate } from "react-router";
import {
  fetchWatchlist,
  updateWatchlistStatus,
  removeFromWatchlist,
  setCurrentPage,
} from "../redux/watchlistSlice";

const WatchlistCard = ({ movie, onRemove, onWatched, onFavorite }) => {
  const navigate = useNavigate();
  const movieData = movie.movie || movie;
  const posterUrl = movieData.coverUrl;
  const releaseYear = movieData.release_date
    ? new Date(movieData.release_date).getFullYear()
    : "Unknown";
  const movieGenres = movieData.genres || movieData.Genres || [];
  const genreNames = movieGenres.map((genre) => genre.name).join(", ");

  const handleViewDetails = () => {
    navigate(`/moviedetails/${movieData.id}`);
  };

  // Get status display info
  const getStatusInfo = (status) => {
    switch (status) {
      case "want":
        return {
          badge: "badge bg-primary",
          text: "Want to Watch",
          icon: "bi bi-bookmark",
        };
      case "watched":
        return {
          badge: "badge bg-success",
          text: "Watched",
          icon: "bi bi-check-circle-fill",
        };
      case "favorite":
        return {
          badge: "badge bg-warning text-dark",
          text: "Favorite",
          icon: "bi bi-heart-fill",
        };
      default:
        return {
          badge: "badge bg-secondary",
          text: "Unknown",
          icon: "bi bi-question-circle",
        };
    }
  };

  const statusInfo = getStatusInfo(movie.status);

  return (
    <div className="col-lg-3 col-md-4 col-sm-6 mb-4">
      <div className="card h-100 shadow-sm movie-card">
        {/* Status Badge */}
        <div
          className="position-absolute top-0 end-0 m-2"
          style={{ zIndex: 1 }}
        >
          <span className={statusInfo.badge}>
            <i className={`${statusInfo.icon} me-1`}></i>
            {statusInfo.text}
          </span>
        </div>

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

            {/* Action Buttons Row */}
            <div className="d-flex gap-1">
              <button
                className={`btn btn-sm flex-fill ${
                  movie.status === "watched"
                    ? "btn-success"
                    : "btn-outline-success"
                }`}
                onClick={() => onWatched(movie.id)}
                title="Mark as Watched"
              >
                <i className="bi bi-check-circle me-1"></i>
                Watched
              </button>
              <button
                className={`btn btn-sm flex-fill ${
                  movie.status === "favorite"
                    ? "btn-warning"
                    : "btn-outline-warning"
                }`}
                onClick={() => onFavorite(movie.id)}
                title="Mark as Favorite"
              >
                <i className="bi bi-heart me-1"></i>
                Favorite
              </button>
            </div>

            <button
              className="btn btn-outline-danger btn-sm"
              onClick={() => onRemove(movie.id)}
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
  const dispatch = useDispatch();
  const {
    items: watchlist,
    loading,
    error,
    pagination,
  } = useSelector((state) => state.watchlist);
  const { currentPage, totalPages } = pagination;

  // Filter state
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    dispatch(fetchWatchlist({ page: currentPage, limit: 20 }));
  }, [dispatch, currentPage]);

  // Filter watchlist based on status
  const filteredWatchlist =
    statusFilter === "all"
      ? watchlist
      : watchlist.filter((movie) => movie.status === statusFilter);

  // Handle watched button click
  const handleWatched = async (watchlistId) => {
    try {
      const result = await Swal.fire({
        title: "Mark as Watched?",
        text: "This will update the movie status to watched.",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#28a745",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Yes, mark as watched!",
      });

      if (result.isConfirmed) {
        await dispatch(
          updateWatchlistStatus({ watchlistId, status: "watched" })
        ).unwrap();

        Swal.fire({
          icon: "success",
          title: "Marked as Watched!",
          text: "Movie status has been updated to watched.",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error || "Failed to update movie status",
      });
    }
  };

  // Handle favorite button click
  const handleFavorite = async (watchlistId) => {
    try {
      const result = await Swal.fire({
        title: "Mark as Favorite?",
        text: "This will update the movie status to favorite.",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#ffc107",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Yes, mark as favorite!",
      });

      if (result.isConfirmed) {
        await dispatch(
          updateWatchlistStatus({ watchlistId, status: "favorite" })
        ).unwrap();

        Swal.fire({
          icon: "success",
          title: "Marked as Favorite!",
          text: "Movie status has been updated to favorite.",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error || "Failed to update movie status",
      });
    }
  };

  const handleRemove = async (watchlistId) => {
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
        await dispatch(removeFromWatchlist(watchlistId)).unwrap();

        Swal.fire({
          icon: "success",
          title: "Removed!",
          text: "Movie has been removed from your watchlist.",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error || "Failed to remove movie from watchlist",
      });
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      dispatch(setCurrentPage(newPage));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleRefresh = () => {
    dispatch(fetchWatchlist({ page: currentPage, limit: 20 }));
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
                {filteredWatchlist.length > 0
                  ? `Showing ${filteredWatchlist.length} movies ${
                      statusFilter !== "all"
                        ? `with status: ${statusFilter}`
                        : "in your watchlist"
                    }`
                  : "Your watchlist is empty"}
              </p>
            </div>
            <button
              className="btn btn-outline-primary"
              onClick={handleRefresh}
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

      {/* Status Filter Toggle */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex flex-wrap gap-2 justify-content-center">
            <button
              className={`btn ${
                statusFilter === "all" ? "btn-primary" : "btn-outline-primary"
              }`}
              onClick={() => setStatusFilter("all")}
            >
              <i className="bi bi-list me-1"></i>
              All ({watchlist.length})
            </button>
            <button
              className={`btn ${
                statusFilter === "want" ? "btn-primary" : "btn-outline-primary"
              }`}
              onClick={() => setStatusFilter("want")}
            >
              <i className="bi bi-bookmark me-1"></i>
              Want to Watch (
              {watchlist.filter((m) => m.status === "want").length})
            </button>
            <button
              className={`btn ${
                statusFilter === "watched"
                  ? "btn-success"
                  : "btn-outline-success"
              }`}
              onClick={() => setStatusFilter("watched")}
            >
              <i className="bi bi-check-circle me-1"></i>
              Watched ({watchlist.filter((m) => m.status === "watched").length})
            </button>
            <button
              className={`btn ${
                statusFilter === "favorite"
                  ? "btn-warning"
                  : "btn-outline-warning"
              }`}
              onClick={() => setStatusFilter("favorite")}
            >
              <i className="bi bi-heart me-1"></i>
              Favorite (
              {watchlist.filter((m) => m.status === "favorite").length})
            </button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="row mb-3">
          <div className="col-12">
            <div className="alert alert-danger" role="alert">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error}
            </div>
          </div>
        </div>
      )}

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
          {filteredWatchlist.length > 0 ? (
            <>
              {/* Movies Grid */}
              <div className="row">
                {filteredWatchlist.map((item, index) => (
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
                <h3 className="text-muted mb-3">
                  {statusFilter === "all"
                    ? "Your watchlist is empty"
                    : `No movies with status: ${statusFilter}`}
                </h3>
                <p className="text-muted mb-4">
                  {statusFilter === "all"
                    ? "Start adding movies to your watchlist to keep track of what you want to watch!"
                    : `Try selecting a different status filter or add more movies to your watchlist.`}
                </p>
                {statusFilter !== "all" ? (
                  <button
                    className="btn btn-primary me-2"
                    onClick={() => setStatusFilter("all")}
                  >
                    <i className="bi bi-list me-1"></i>
                    Show All Movies
                  </button>
                ) : null}
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
