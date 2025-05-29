import { useState } from "react";
import { Link, useNavigate } from "react-router";

const Navbar = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  // Check if user is logged in using the correct token key
  const isLoggedIn = localStorage.getItem("access_token");
  const username = localStorage.getItem("username") || "User";

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to home with search query
      navigate(`/?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("login_email");
    navigate("/login");
  };

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
              <Link className="nav-link" to="/">
                <i className="bi bi-house-door me-1"></i>
                Home
              </Link>
            </li>
            {isLoggedIn && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/profile">
                    <i className="bi bi-person me-1"></i>
                    Profile
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/watchlist">
                    <i className="bi bi-bookmark-heart me-1"></i>
                    My Watchlist
                  </Link>
                </li>
              </>
            )}
          </ul>

          {/* Center - Search Form */}
          {isLoggedIn && (
            <form
              className="d-flex mx-3 flex-grow-1"
              onSubmit={handleSearch}
              style={{ maxWidth: "400px" }}
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
                <button className="btn btn-primary" type="submit">
                  <i className="bi bi-search">Search</i>
                </button>
              </div>
            </form>
          )}

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
                  {username}
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
                      Logout
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
