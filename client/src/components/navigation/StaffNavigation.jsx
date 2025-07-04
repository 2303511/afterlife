import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { staffRoutes, adminRoutes } from "../../config/routesConfig";
import "../../styles/AfterLife-Theme.css";
import logo from "../../img/logo.svg";
import axios from "axios";

export default function StaffNavigation() {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    axios.get("/api/user/me", { withCredentials: true })
    .then(res => {
      setUser(res.data);
    })
    .catch(err => console.error("Failed to fetch session:", err));
  }, []);

  const role = user?.role; 

  const routes = role === "admin" ? adminRoutes : staffRoutes;

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
        <div className="sidebar-role mt-2">Logged in as {role}</div>
      </div>



      {/* Navigation Links */}
      <nav className="sidebar-nav">
        {routes.map((item, idx) => (
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
      {/* Footer (profile + logout + label) */}
      <div className="sidebar-footer">
        <Link to="/profile" className="nav-item footer-nav">
          <div className="nav-item-content">
            <i className="bi bi-person-circle icon"></i>
            <span>Profile</span>
          </div>
        </Link>

        <button
          className="nav-item footer-nav text-danger"
          onClick={() => {
            window.location.href = "/logout";
          }}
        >
          <div className="nav-item-content">
            <i className="bi bi-box-arrow-right icon"></i>
            <span>Logout</span>
          </div>
        </button>

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
