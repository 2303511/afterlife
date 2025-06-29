import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoute from "../src/components/navigation/ProtectedRoute";
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

import { appRoutes } from "./config/routesConfig";
import RoleLayout from "./layouts/RoleLayout";
import PublicLayout from "./layouts/PublicLayout";
import { publicRoutes } from "./config/routesConfig";

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import PageNotFound from './pages/PageNotFound';
import PaymentSuccess from './pages/PaymentSuccess';
import LandingPage from "./pages/public/LandingPage";
import Unauthorized from "./pages/Unauthorized";

function App() {
  localStorage.setItem("role", "staff"); // temp, change here to see staff and user navbar changes
  return (
    <Router>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        {/* Public routes */}
        {publicRoutes.map(({ path, element }) => (
          <Route key={path} path={path} element={<PublicLayout>{element}</PublicLayout>} />
        ))}

        {/* Protected + role-based layout routes */}
        <Route element={<RoleLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="payment-success" element={<PaymentSuccess />} />

          {appRoutes.map(({ path, element, requiredRoles }) => (
            <Route
              key={path}
              path={path}
              element={
                <ProtectedRoute allowedRoles={requiredRoles}>
                  {element}
                </ProtectedRoute>
              }
            />
          ))}
        </Route>

        {/* Unauthorized page */}
        <Route path="/unauthorized" element={<Unauthorized />} />
        
        {/* Page Not Found */}
        <Route path="*" element={<PublicLayout> {<PageNotFound/>} </PublicLayout>} />

      </Routes>
    </Router>
  );
}

export default App;
