// src/components/RoleLayout.js
import { Outlet, useLocation, Navigate } from "react-router-dom";
import UserLayout from "./UserLayout";
import StaffLayout from "./StaffLayout";
import PublicLayout from "./PublicLayout";
import { publicPaths } from "../config/routesConfig";

import Unauthorized from "../pages/Unauthorized";

export default function RoleLayout() {
    const role = sessionStorage.getItem("role");
    const { pathname } = useLocation();

    if (pathname === "/" && role === "user") {
        return <Navigate to="/my-bookings" replace />;
    }

    if (pathname === "/" && role === "staff") {
        return <Navigate to="/dashboard" replace />;
    }

    if (pathname === "/" && role === "admin") {
        return <Navigate to="/admin-dashboard" replace />;
    }
  
    // Public pages use PublicLayout or no layout at all
    if (publicPaths.includes(pathname)) {
        return (
          <PublicLayout>
            <Outlet />
          </PublicLayout>
        );
    }
  
    if (role === "staff" || role === "admin") {
      return (
        <StaffLayout>
          <Outlet />
        </StaffLayout>
      );
    }
  
    if (role === "user") {
      return (
        <UserLayout>
          <Outlet />
        </UserLayout>
      );
    }
  

    // If not logged in and not accessing a public page
    return <Unauthorized />;
  }