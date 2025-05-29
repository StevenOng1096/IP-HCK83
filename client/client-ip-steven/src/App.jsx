import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router";
import AuthLayout from "./layout/AuthLayout";
import MainLayout from "./layout/MainLayout";
import HomePublic from "./pages/HomePublic";
import PublicLayout from "./layout/PublicLayout";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* public routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePublic />} />
            <Route path="/detail/:id" element={<h1>Movie detail</h1>} />
          </Route>

          {/* Auth/Login Route */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<h1>Login Page</h1>} />
            <Route path="/register" element={<h1>Register Page</h1>} />
          </Route>

          {/* Main CMS */}
          <Route element={<MainLayout />}>
            <Route path="/cms" element={<h1>Main CMS Page</h1>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
