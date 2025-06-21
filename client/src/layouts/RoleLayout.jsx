// src/components/RoleLayout.js
import { Outlet, useLocation } from "react-router-dom";
import UserLayout from "./UserLayout";
import StaffLayout from "./StaffLayout";
import PublicLayout from "./PublicLayout";
import { publicPaths } from "../config/routesConfig";

export default function RoleLayout() {
    const role = sessionStorage.getItem("role");
    const { pathname } = useLocation();
  
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
    return <div>Unauthorized — Please log in.</div>;
  }