import { useState } from "react";
import { Link } from "react-router-dom";
import { appRoutes } from "../config/routesConfig";

export default function Sidebar() {
  return (
    <aside className="d-flex flex-column bg-light border-end min-vh-100" style={{ width: "250px" }}>
      <div className="border-bottom p-3">
        <h2 className="text-primary fw-bold">Afterlife</h2>
      </div>

      <nav className="p-3 d-flex flex-column gap-2">
       {appRoutes.map((item, idx) => (
          <NavItem key={idx} icon={item.icon} label={item.label} to={item.path} />
        ))}
      </nav>
    </aside>
  );
}

function NavItem({ icon, label, to, badge, badgeColor = "secondary", count }) {
  const [hovered, setHovered] = useState(false);

  const linkStyle = {
    backgroundColor: hovered ? "#f1f3f5" : "transparent",
    transition: "background-color 0.2s ease",
    fontSize: "0.95rem",
    border: "none",
    width: "100%",
    textAlign: "left",
    padding: "0.5rem 0.75rem",
    borderRadius: "0.375rem",
    textDecoration: "none",
    color: "inherit"
  };

  return (
    <Link
      to={to}
      style={linkStyle}
      className="d-flex justify-content-between align-items-center"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="d-flex align-items-center gap-2">
        <span className="text-muted fs-5">{icon}</span>
        <span>{label}</span>
      </div>

      {badge && <span className={`badge bg-${badgeColor} ms-auto`}>{badge}</span>}
      {count !== undefined && <span className="badge bg-primary ms-2">{count}</span>}
    </Link>
  );
}
