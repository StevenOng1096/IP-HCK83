import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router";
import AuthLayout from "./layout/AuthLayout";
import MainLayout from "./layout/MainLayout";

import Login from "./pages/Login";
import Register from "./pages/Register";
import HomePage from "./pages/HomePage";
import Profile from "./pages/Profile";
// import Watchlist from "./pages/Watchlist";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* Auth/Login Route */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Main CMS */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/profile" element={<Profile />} />
            {/* <Route path="/watchlist" element={<Watchlist />} /> */}
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
