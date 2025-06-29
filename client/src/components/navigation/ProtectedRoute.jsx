// src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ allowedRoles, children }) {
  const role = sessionStorage.getItem("role");

  if (!allowedRoles.includes(role)) {
    // Not allowed → redirect
    return <Navigate to="/unauthorized" replace />;
  }

  // Allowed → show page
  return children;
}
