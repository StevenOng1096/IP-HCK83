import axios from "../lib/http";
import { useState } from "react";
import { useNavigate, Link } from "react-router";
import Swal from "sweetalert2";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (password.length < 6) {
      Swal.fire({
        title: "Error!",
        text: "Password harus minimal 6 karakter",
        icon: "error",
      });
      return;
    }

    setLoading(true);

    try {
      const { data } = await axios.post("/auth/register", {
        username,
        email,
        password,
      });

      console.log(data);

      Swal.fire({
        title: "Success!",
        text: "Registrasi berhasil! Silakan login dengan akun Anda",
        icon: "success",
      }).then(() => {
        navigate("/login");
      });
    } catch (error) {
      console.log(error);
      const errorMessage =
        error.response?.data?.message || "Registrasi gagal! Silakan coba lagi";

      Swal.fire({
        title: "Error!",
        text: errorMessage,
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const goHome = () => {
    navigate("/");
  };

  return (
    <div className="container-fluid bg-light text-dark min-vh-100 d-flex justify-content-center align-items-center">
      <div
        className="card bg-white text-dark shadow-sm"
        style={{ maxWidth: "450px", width: "100%" }}
      >
        <div className="card-body">
          <div className="text-center mb-4">
            <h1 className="display-5 mb-3">Movie Finder App</h1>
            <p className="text-muted">Create your account to get started</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="username" className="form-label">
                Username <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
                minLength="3"
              />
            </div>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                Email <span className="text-danger">*</span>
              </label>
              <input
                type="email"
                className="form-control"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>{" "}
            <div className="mb-4">
              <label htmlFor="password" className="form-label">
                Password <span className="text-danger">*</span>
              </label>
              <div className="input-group">
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  minLength="6"
                />
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
              <div className="form-text">
                Password must be at least 6 characters long
              </div>
            </div>
            <div className="d-grid gap-2 mt-4">
              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>

              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={goHome}
                disabled={loading}
              >
                Go back home
              </button>
            </div>
          </form>

          <div className="text-center mt-4">
            <p className="mb-0">
              Already have an account?{" "}
              <Link to="/login" className="text-decoration-none fw-bold">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
