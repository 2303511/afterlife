// src/components/ProtectedRoute.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ allowedRoles, children }) {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    axios.get("/api/user/me", { withCredentials: true })
      .then(res => {
        setUser(res.data);
      })
      .catch(err => console.error("Failed to fetch session:", err));
  }, []);

  if (user === undefined) return null;  
  const role = user?.role;  

  if (!allowedRoles.includes(role)) {
    // Not allowed → redirect
    return <Navigate to="/unauthorized" replace />;
  }

  // Allowed → show page
  return children;
}
