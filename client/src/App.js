import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css'; // ← put this FIRST
import './index.css'; // your custom styles

// TODO: import pages here
import UsersPage from './pages/testingUsersPage';
import MainLayout from "./layouts/MainLayout"; // assuming this is where your layout is
import Login from "./pages/Main/Login";
import HomePage from "./pages/Main/LandingPage";
import MyBookings from "./pages/Main/MyBookings";

import { appRoutes } from "./config/routesConfig";

function App() {
  return (
    <Router>
      <Routes>
        {/* Default path - redirect to dashboard */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />

        {/* USER */}
        <Route path="/my-bookings" element={<MyBookings />} />

        {/* ADMIN */}
        <Route path="/users" element={<UsersPage />} />

        {/* All other routes use MainLayout */}
        <Route
          path="*"
          element={
            <MainLayout>
              <Routes>
                {appRoutes.map(({ path, element }) => (
                  <Route key={path} path={path} element={element} />
                ))}
              </Routes>
            </MainLayout>
          }
        />
        
      </Routes>
    </Router>
  );
}

export default App;
