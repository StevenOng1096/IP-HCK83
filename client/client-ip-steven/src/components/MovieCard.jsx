export default function MovieCard({ movie }) {
  // Base URL for TMDB images (you might want to move this to a config file)
  const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

  // Fallback poster if no poster_path
  const posterUrl = movie.coverUrl;

  // Format release date
  const releaseYear = movie.release_date
    ? new Date(movie.release_date).getFullYear()
    : "Unknown";

  // Format rating
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : "N/A";

  return (
    <div className="col-lg-3 col-md-4 col-sm-6 mb-4">
      <div className="card h-100 shadow-sm movie-card">
        <img
          src={posterUrl}
          className="card-img-top"
          alt={movie.title || "Movie poster"}
          style={{ height: "400px", objectFit: "cover" }}
          onError={(e) => {
            e.target.src =
              "https://via.placeholder.com/200x300.png?text=No+Poster";
          }}
        />
        <div className="card-body d-flex flex-column">
          <h6 className="card-title text-truncate" title={movie.title}>
            {movie.title || "Unknown Title"}
          </h6>
          <div className="mt-auto">
            <p className="card-text small text-muted mb-1">
              <i className="bi bi-calendar me-1"></i>
              Released: {releaseYear}
            </p>
            <div className="d-flex justify-content-between align-items-center">
              <span className="badge bg-warning text-dark">
                <i className="bi bi-star-fill me-1"></i>
                {rating}
              </span>
              {movie.Genres && movie.Genres.length > 0 && (
                <small className="text-muted">{movie.Genres[0].name}</small>
              )}
            </div>
          </div>
        </div>
        <div className="card-footer bg-transparent border-top-0">
          <button className="btn btn-primary btn-sm w-100">
            <i className="bi bi-info-circle me-1"></i>
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}
