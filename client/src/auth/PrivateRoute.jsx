// src/auth/PrivateRoute.jsx

import React, { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "./AuthContext";

export default function PrivateRoute({ roles }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div>Loading…</div>;
  if (!user)       return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
