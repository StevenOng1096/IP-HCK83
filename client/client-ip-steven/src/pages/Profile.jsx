import { useState, useEffect } from "react";
import axios from "../lib/http";
import Swal from "sweetalert2";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    favorite_genres: [],
  });

  // Genre mapping (you can expand this based on your genre data)
  const genreMap = {
    1: "Action",
    2: "Adventure",
    3: "Animation",
    4: "Comedy",
    5: "Crime",
    6: "Documentary",
    7: "Drama",
    8: "Family",
    9: "Fantasy",
    10: "History",
    11: "Horror",
    12: "Music",
    13: "Mystery",
    14: "Romance",
    15: "Science Fiction",
    16: "TV Movie",
    17: "Thriller",
    18: "War",
    19: "Western",
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/auth/profile", {
        headers: {
          Authorization: `Bearer ${localStorage.access_token}`,
        },
      });

      if (data.success) {
        setUser(data.data.user);
        setFormData({
          username: data.data.user.username,
          email: data.data.user.email,
          favorite_genres: data.data.user.favorite_genres || [],
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Failed to fetch profile",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Add this new handler function after the handleInputChange function
  const handleGenreChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions);
    const selectedGenreIds = selectedOptions.map((option) =>
      parseInt(option.value)
    );
    setFormData((prev) => ({
      ...prev,
      favorite_genres: selectedGenreIds,
    }));
  };

  const handleSave = async () => {
    try {
      const { data } = await axios.patch("/auth/profile", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.access_token}`,
        },
      });

      if (data.success) {
        setUser(data.data.user);
        setEditing(false);
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Profile updated successfully!",
        });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Failed to update profile",
      });
    }
  };

  const handleCancel = () => {
    setFormData({
      username: user.username,
      email: user.email,
      favorite_genres: user.favorite_genres || [],
    });
    setEditing(false);
  };

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-12 text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-muted">Loading your profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="alert alert-danger text-center">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              Failed to load profile data
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          {/* Profile Header */}
          <div className="card shadow-lg border-0 mb-4">
            <div className="card-header bg-gradient bg-primary text-white">
              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center">
                  <div className="bg-white rounded-circle p-3 me-3">
                    <i className="bi bi-person-fill text-primary fs-2"></i>
                  </div>
                  <div>
                    <h3 className="mb-0 fw-bold">My Profile</h3>
                    <p className="mb-0 opacity-75">
                      Manage your account information
                    </p>
                  </div>
                </div>
                {!editing && (
                  <button
                    className="btn btn-light btn-sm"
                    onClick={() => setEditing(true)}
                  >
                    <i className="bi bi-pencil-square me-1"></i>
                    Edit Profile
                  </button>
                )}
              </div>
            </div>

            <div className="card-body p-4">
              {/* User Information */}
              <div className="row mb-4">
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold text-muted">
                    <i className="bi bi-person me-2"></i>Username
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      placeholder="Enter username"
                    />
                  ) : (
                    <div className="form-control form-control-lg bg-light border-0">
                      {user.username}
                    </div>
                  )}
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold text-muted">
                    <i className="bi bi-envelope me-2"></i>Email Address
                  </label>
                  {editing ? (
                    <input
                      type="email"
                      className="form-control form-control-lg"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter email address"
                    />
                  ) : (
                    <div className="form-control form-control-lg bg-light border-0">
                      {user.email}
                    </div>
                  )}
                </div>
              </div>

              {/* Account Details */}
              <div className="row mb-4">
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold text-muted">
                    <i className="bi bi-calendar-check me-2"></i>Member Since
                  </label>
                  <div className="form-control form-control-lg bg-light border-0">
                    {new Date(user.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold text-muted">
                    <i className="bi bi-clock-history me-2"></i>Last Updated
                  </label>
                  <div className="form-control form-control-lg bg-light border-0">
                    {new Date(user.updatedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                </div>
              </div>

              {/* Favorite Genres */}
              <div className="mb-4">
                <label className="form-label fw-semibold text-muted">
                  <i className="bi bi-heart-fill me-2"></i>Favorite Genres
                </label>
                {editing ? (
                  <div className="mt-2">
                    <select
                      multiple
                      className="form-select form-select-lg"
                      value={formData.favorite_genres.map((id) =>
                        id.toString()
                      )}
                      onChange={handleGenreChange}
                      style={{ minHeight: "150px" }}
                    >
                      {Object.entries(genreMap).map(([id, name]) => (
                        <option key={id} value={id}>
                          {name}
                        </option>
                      ))}
                    </select>
                    <div className="form-text">
                      <i className="bi bi-info-circle me-1"></i>
                      Hold Ctrl (Windows) or Cmd (Mac) to select multiple genres
                    </div>
                    {formData.favorite_genres.length > 0 && (
                      <div className="mt-2">
                        <small className="text-muted">Selected genres:</small>
                        <div className="d-flex flex-wrap gap-1 mt-1">
                          {formData.favorite_genres.map((genreId) => (
                            <span
                              key={genreId}
                              className="badge bg-primary-subtle text-primary px-2 py-1 rounded-pill"
                            >
                              {genreMap[genreId] || `Genre ${genreId}`}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mt-2">
                    {user.favorite_genres && user.favorite_genres.length > 0 ? (
                      <div className="d-flex flex-wrap gap-2">
                        {user.favorite_genres.map((genreId) => (
                          <span
                            key={genreId}
                            className="badge bg-primary fs-6 px-3 py-2 rounded-pill"
                          >
                            <i className="bi bi-star-fill me-1"></i>
                            {genreMap[genreId] || `Genre ${genreId}`}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="text-muted fst-italic">
                        <i className="bi bi-info-circle me-1"></i>
                        No favorite genres selected yet
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {editing && (
                <div className="d-flex gap-2 justify-content-end">
                  <button
                    className="btn btn-outline-secondary"
                    onClick={handleCancel}
                  >
                    <i className="bi bi-x-circle me-1"></i>
                    Cancel
                  </button>
                  <button className="btn btn-primary" onClick={handleSave}>
                    <i className="bi bi-check-circle me-1"></i>
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Profile Stats */}
          <div className="row">
            <div className="col-md-4 mb-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body text-center">
                  <div
                    className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                    style={{ width: "60px", height: "60px" }}
                  >
                    <i className="bi bi-person-badge text-primary fs-3"></i>
                  </div>
                  <h6 className="card-title text-muted mb-1">User ID</h6>
                  <h4 className="text-primary mb-0">#{user.id}</h4>
                </div>
              </div>
            </div>

            <div className="col-md-4 mb-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body text-center">
                  <div
                    className="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                    style={{ width: "60px", height: "60px" }}
                  >
                    <i className="bi bi-heart-fill text-success fs-3"></i>
                  </div>
                  <h6 className="card-title text-muted mb-1">
                    Favorite Genres
                  </h6>
                  <h4 className="text-success mb-0">
                    {user.favorite_genres?.length || 0}
                  </h4>
                </div>
              </div>
            </div>

            <div className="col-md-4 mb-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body text-center">
                  <div
                    className="bg-warning bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                    style={{ width: "60px", height: "60px" }}
                  >
                    <i className="bi bi-calendar-check text-warning fs-3"></i>
                  </div>
                  <h6 className="card-title text-muted mb-1">Days Active</h6>
                  <h4 className="text-warning mb-0">
                    {Math.floor(
                      (new Date() - new Date(user.createdAt)) /
                        (1000 * 60 * 60 * 24)
                    )}
                  </h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
