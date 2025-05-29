import { Navigate, Outlet } from "react-router";
import Navbar from "../components/Navbar";

export default function MainLayout() {
  const token = localStorage.access_token;

  if (!token) {
    return <Navigate to="/login" />;
  }

  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
}
