import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router";
import AuthLayout from "./layout/AuthLayout";
import MainLayout from "./layout/MainLayout";
import HomePublic from "./pages/HomePublic";
import PublicLayout from "./layout/PublicLayout";
import Login from "./pages/Login";
import Register from "./pages/Register";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* public routes */}
          {/* <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePublic />} />
            <Route path="/detail/:id" element={<h1>Movie detail</h1>} />
          </Route> */}

          {/* Auth/Login Route */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Main CMS */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<h1>Main CMS Page</h1>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
