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

import PageNotFound from './pages/public/PageNotFound';
import Unauthorized from "./pages/public/Unauthorized";

import { AuthProvider } from "./auth/AuthContext";

function App() {
  return (
    <AuthProvider>  
      <Router>
        <ToastContainer position="top-right" autoClose={3000} />
        <Routes>
          {/* Public routes */}
          {publicRoutes.map(({ path, element }) => (
            <Route key={path} path={path} element={<PublicLayout>{element}</PublicLayout>} />
          ))}

          {/* Protected + role-based layout routes */}
          <Route element={<RoleLayout />}>
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
    </AuthProvider> 
  );
}

export default App;
