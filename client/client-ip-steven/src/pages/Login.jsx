import axios from "../lib/http";
import { useEffect } from "react";
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

    setLoading(true);

    try {
      const { data } = await axios.post("/auth/login", {
        email,
        password,
      });

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
  // ----------------------
  useEffect(() => {
    async function handleCredentialResponse(response) {
      try {
        setLoading(true);

        const { data } = await axios.post("/auth/google-login", {
          id_token: response.credential,
        });

        // Store token and email
        localStorage.setItem(
          "access_token",
          data.access_token || data.data.token
        );
        localStorage.setItem("login_email", data.email || data.data.user.email);

        Swal.fire({
          title: "Success!",
          text: "Google login successful!",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });

        navigate("/");
      } catch (error) {
        console.error("Google login error:", error);

        const errorMessage =
          error.response?.data?.message ||
          "Google login failed! Please try again.";

        Swal.fire({
          title: "Error!",
          text: errorMessage,
          icon: "error",
        });
      } finally {
        setLoading(false);
      }
    } // Initialize Google Sign-In when the component mounts
    const initializeGoogleSignIn = () => {
      console.log(
        "VITE_GOOGLE_CLIENT_ID:",
        import.meta.env.VITE_GOOGLE_CLIENT_ID
      );

      if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) {
        console.error(
          "Google Client ID is not defined in environment variables"
        );
        return;
      }

      if (window.google && window.google.accounts) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
        });

        // Render button only if the element exists
        const buttonDiv = document.getElementById("buttonDiv");
        if (buttonDiv) {
          window.google.accounts.id.renderButton(buttonDiv, {
            theme: "outline",
            size: "large",
            width: "100%",
            text: "signin_with",
            shape: "rectangular",
          });
        }
      } else {
        // Retry after a short delay if Google script hasn't loaded yet
        setTimeout(initializeGoogleSignIn, 100);
      }
    };

    // Start initialization
    initializeGoogleSignIn();
  }, []);

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
            </div>
          </form>
          <div className="text-center my-3">
            <div className="d-flex align-items-center">
              <hr className="flex-grow-1" />
              <span className="px-3 text-muted small">OR</span>
              <hr className="flex-grow-1" />
            </div>
          </div>
          <div id="buttonDiv" className="mb-3 w-100"></div>
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
