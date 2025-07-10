// src/components/RoleLayout.js
import { useEffect, useState } from "react";
import axios from 'axios';
import { Outlet, useLocation, Navigate } from "react-router-dom";
import UserLayout from "./UserLayout";
import StaffLayout from "./StaffLayout";
import PublicLayout from "./PublicLayout";
import { publicPaths } from "../config/routesConfig";

import Unauthorized from "../pages/public/Unauthorized";

export default function RoleLayout() {
    const { pathname } = useLocation();
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

    if (pathname === "/" && role === "user") {
        return <Navigate to="/my-bookings" replace />;
    }

    if (pathname === "/" && role === "staff") {
        return <Navigate to="/search-booking" replace />;
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