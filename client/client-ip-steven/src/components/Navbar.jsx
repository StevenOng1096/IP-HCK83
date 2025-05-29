import { useState } from "react";
import { Link, useNavigate } from "react-router";

const Navbar = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("popularity");
  const [releaseYear, setReleaseYear] = useState("");

  // Check if user is logged in (you can replace this with your auth logic)
  const isLoggedIn = localStorage.getItem("token");
  const username = localStorage.getItem("username");

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to search results with query parameters
      const searchParams = new URLSearchParams({
        q: searchQuery,
        sort: sortBy,
        ...(releaseYear && { year: releaseYear }),
      });
      navigate(`/search?${searchParams.toString()}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    navigate("/");
  };

  // Generate year options (current year down to 1900)
  const currentYear = new Date().getFullYear();
  const yearOptions = [];
  for (let year = currentYear; year >= 1900; year--) {
    yearOptions.push(year);
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top shadow">
      <div className="container">
        {/* Brand/Logo */}
        <Link className="navbar-brand fw-bold" to="/">
          <i className="bi bi-film me-2"></i>
          MovieFinder
        </Link>

        {/* Mobile toggle button */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Collapsible content */}
        <div className="collapse navbar-collapse" id="navbarNav">
          {/* Left side navigation */}
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link active" to="/">
                <i className="bi bi-house-door me-1"></i>
                Home
              </Link>
            </li>
            {isLoggedIn && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/movies">
                    <i className="bi bi-collection-play me-1"></i>
                    Movies
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/watchlist">
                    <i className="bi bi-bookmark-heart me-1"></i>
                    My Watchlist
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/recommendations">
                    <i className="bi bi-stars me-1"></i>
                    Recommendations
                  </Link>
                </li>
              </>
            )}
          </ul>

          {/* Center - Search Form */}
          <form
            className="d-flex mx-3 flex-grow-1"
            onSubmit={handleSearch}
            style={{ maxWidth: "500px" }}
          >
            <div className="input-group">
              <input
                className="form-control"
                type="search"
                placeholder="Search movies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search movies"
              />

              {/* Sort Dropdown */}
              <select
                className="form-select"
                style={{ maxWidth: "140px" }}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Sort by"
              >
                <option value="popularity">Popular</option>
                <option value="vote_average">Rating</option>
                <option value="release_date">Newest</option>
                <option value="title">A-Z</option>
              </select>

              {/* Year Filter */}
              <select
                className="form-select"
                style={{ maxWidth: "100px" }}
                value={releaseYear}
                onChange={(e) => setReleaseYear(e.target.value)}
                aria-label="Filter by year"
              >
                <option value="">All Years</option>
                {yearOptions.slice(0, 30).map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>

              <button className="btn btn-primary" type="submit">
                <i className="bi bi-search">Go</i>
              </button>
            </div>
          </form>

          {/* Right side - User actions */}
          <ul className="navbar-nav">
            {isLoggedIn ? (
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle d-flex align-items-center"
                  href="#"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i className="bi bi-person-circle me-1"></i>
                  {username || "User"}
                </a>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li>
                    <Link className="dropdown-item" to="/profile">
                      <i className="bi bi-person me-2"></i>
                      Profile
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/watchlist">
                      <i className="bi bi-bookmark-heart me-2"></i>
                      My Watchlist
                    </Link>
                  </li>
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                  <li>
                    <button className="dropdown-item" onClick={handleLogout}>
                      <i className="bi bi-box-arrow-right me-2"></i>
                      Sign Out
                    </button>
                  </li>
                </ul>
              </li>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">
                    <i className="bi bi-box-arrow-in-right me-1"></i>
                    Sign In
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="btn btn-outline-light ms-2" to="/register">
                    Sign Up
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
