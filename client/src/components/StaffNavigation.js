import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { staffRoutes } from "../config/routesConfig";
import "../styles/SideBar.css"; 
import logo from "../img/logo.svg";

export default function StaffNavigation() {
  return (
    <aside className="sidebar">
      {/* Logo Section */}
      <div className="sidebar-header text-center">
  <img
    src={logo}
    alt="Afterlife Logo"
    className="logo-img"
    height="50" 
  />
</div>

      {/* Navigation Links */}
      <nav className="sidebar-nav">
        {staffRoutes.map((item, idx) => (
          <NavItem
            key={idx}
            icon={item.icon}
            label={item.label}
            to={item.path}
            badge={item.badge}
            badgeColor={item.badgeColor}
            count={item.count}
          />
        ))}
      </nav>

      {/* Footer (optional: user avatar, logout) */}
      <div className="sidebar-footer">
        <small className="text-muted">Logged in as Staff</small>
      </div>
    </aside>
  );
}

function NavItem({ icon, label, to, badge, badgeColor = "secondary", count }) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`nav-item ${isActive ? "active" : ""}`}
    >
      <div className="nav-item-content">
        <span className="icon">{icon}</span>
        <span className="label">{label}</span>
      </div>

      {/* Optional badges */}
      {badge && <span className={`badge bg-${badgeColor}`}>{badge}</span>}
      {count !== undefined && <span className="badge bg-primary">{count}</span>}
    </Link>
  );
}
