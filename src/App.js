import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css'; // ← put this FIRST
import './index.css'; // your custom styles

import MainLayout from "./layouts/MainLayout"; // assuming this is where your layout is
import Login from "./pages/Login";

import { appRoutes } from "./config/routesConfig";

function App() {
  return (
    <Router>
      <Routes>
        {/* Default path - redirect to dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Login route (without layout) */}
        <Route path="/login" element={<Login />} />

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
