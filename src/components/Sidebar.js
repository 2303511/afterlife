import {
    FaLock,
    FaUser,
    FaBoxOpen,
    FaFileInvoice,
    FaShoppingCart,
    FaEnvelope,
    FaBell,
    FaCog,
    FaColumns,
  } from "react-icons/fa";
  import { useState } from "react";
  import { MdDashboard } from "react-icons/md";
  
  export default function Sidebar() {
    return (
      <aside className="d-flex flex-column bg-light border-end min-vh-100" style={{ width: "250px" }}>
        {/* Logo */}
        <div className="border-bottom p-3">
          <h2 className="text-primary fw-bold">Afterlife</h2>
        </div>
  
        {/* Navigation */}
        <nav className="p-3 d-flex flex-column gap-2">
          <NavItem icon={<MdDashboard />} label="Dashboard" />
          <NavItem icon={<FaLock />} label="Authentication" />
          <NavItem icon={<FaUser />} label="Users"  /> {/*badge="HOT" badgeColor="danger" */}
          <NavItem icon={<FaBoxOpen />} label="Products" /> {/*badge="NEW" badgeColor="warning */}
          <NavItem icon={<FaFileInvoice />} label="Invoices" />
          <NavItem icon={<FaShoppingCart />} label="Orders"  /> {/*count={5} */}
          <NavItem icon={<FaEnvelope />} label="Messages" /> {/*count={5} */}
          <NavItem icon={<FaBell />} label="Notifications" /> {/*count={5} */}
          <NavItem icon={<FaCog />} label="Settings" />
          <NavItem icon={<FaColumns />} label="Blank Page" />
        </nav>
      </aside>
    );
  }
  


  function NavItem({ icon, label, badge, badgeColor = "secondary", count }) {
    const [hovered, setHovered] = useState(false);
  
    const buttonStyle = {
      backgroundColor: hovered ? "#f1f3f5" : "transparent", // Light gray on hover
      transition: "background-color 0.2s ease",
      fontSize: "0.95rem",
      border: "none",
      width: "100%",
      textAlign: "left",
      padding: "0.5rem 0.75rem",
      borderRadius: "0.375rem", // 6px
    };
  
    return (
      <button
        type="button"
        style={buttonStyle}
        className="d-flex justify-content-between align-items-center"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="d-flex align-items-center gap-2">
          <span className="text-muted fs-5">{icon}</span>
          <span>{label}</span>
        </div>
  
        {badge && (
          <span className={`badge bg-${badgeColor} ms-auto`}>{badge}</span>
        )}
  
        {count !== undefined && (
          <span className="badge bg-primary ms-2">{count}</span>
        )}
      </button>
    );
  }