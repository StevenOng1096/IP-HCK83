import { useEffect, useCallback } from "react";
import Swal from "sweetalert2";
import axios from "../lib/http";
import { useState } from "react";
import MovieCard from "../components/MovieCard";

export default function HomePublic() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchMovies = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/movies?page=${currentPage}&limit=20`);
      console.log("Movies data:", data.data.movies);
      setMovies(data.data.movies || []);

      // Set pagination info if available
      if (data.data.pagination) {
        setTotalPages(data.data.pagination.totalPages);
      }
    } catch (error) {
      console.error("Error fetching movies:", error);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text:
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch movies",
      });
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="container-fluid py-4">
      {/* Hero Section */}
      <div className="row mb-5">
        <div className="col-12">
          <div className="bg-dark text-white rounded p-5 text-center">
            <h1 className="display-4 fw-bold mb-3">
              <i className="bi bi-film me-3"></i>
              Discover Amazing Movies
            </h1>
            <p className="lead mb-4">
              Explore thousands of movies, find your favorites, and get
              personalized recommendations
            </p>
            <div className="d-flex justify-content-center gap-3">
              <span className="badge bg-primary fs-6 px-3 py-2">
                <i className="bi bi-collection-play me-1"></i>
                Latest Movies
              </span>
              <span className="badge bg-success fs-6 px-3 py-2">
                <i className="bi bi-star-fill me-1"></i>
                Top Rated
              </span>
              <span className="badge bg-warning text-dark fs-6 px-3 py-2">
                <i className="bi bi-heart-fill me-1"></i>
                Popular
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Movies Section */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="fw-bold">
              <i className="bi bi-camera-reels me-2"></i>
              Featured Movies
            </h2>
            <span className="text-muted">
              Page {currentPage} of {totalPages}
            </span>
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
            <p className="mt-3 text-muted">Loading amazing movies...</p>
          </div>
        </div>
      )}

      {/* Movies Grid */}
      {!loading && (
        <>
          {movies.length > 0 ? (
            <div className="row">
              {movies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          ) : (
            <div className="row">
              <div className="col-12 text-center py-5">
                <i className="bi bi-film display-1 text-muted mb-3"></i>
                <h3 className="text-muted">No movies found</h3>
                <p className="text-muted">
                  We couldn't find any movies at the moment. Please try again
                  later.
                </p>
              </div>
            </div>
          )}

          {/* Pagination */}
          {movies.length > 0 && totalPages > 1 && (
            <div className="row mt-5">
              <div className="col-12">
                <nav aria-label="Movies pagination">
                  <ul className="pagination pagination-lg justify-content-center">
                    <li
                      className={`page-item ${
                        currentPage === 1 ? "disabled" : ""
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
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
                        currentPage === totalPages ? "disabled" : ""
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
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
      )}
    </div>
  );
}
