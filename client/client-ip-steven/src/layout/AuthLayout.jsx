import { Outlet, Navigate } from "react-router";

export default function AuthLayout() {
  const token = localStorage.access_token;
  if (token) {
    return <Navigate to="/" />;
  }

  return <Outlet />;
}
