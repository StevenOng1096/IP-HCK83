import axios from "../lib/http";
import { useState } from "react";
import { useNavigate, Link } from "react-router";
import Swal from "sweetalert2";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Login attempt with:", { email, password });

    setLoading(true);

    try {
      const { data } = await axios.post("/auth/login", {
        email,
        password,
      });

      console.log(data);
      const token = data.data.token;

      localStorage.setItem("access_token", token);
      localStorage.setItem("login_email", email);

      console.log("Login successful!");

      navigate("/");
    } catch (error) {
      console.log(error);
      const errorMessage =
        error.response?.data?.message ||
        "Login gagal! Silakan ulangi kembali dengan email dan password yang benar";

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
            <h1 className="display-5 mb-3">Welcome Back</h1>
            <p className="text-muted">
              Sign in to your Movie Finder App account
            </p>
          </div>{" "}
          <form onSubmit={handleSubmit}>
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
            </div>
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
                />
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>{" "}
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
                    Signing in...
                  </>
                ) : (
                  "Sign in"
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
              Don't have an account?{" "}
              <Link to="/register" className="text-decoration-none fw-bold">
                Create one here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
