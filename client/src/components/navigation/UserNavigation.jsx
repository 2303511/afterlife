// src/components/Navbar.js
import { FaSearch, FaUser } from "react-icons/fa";
import logo from "../../img/logo.svg";
import { userRoutes } from "../../config/routesConfig";

export default function UserNavigation() {
    return (
      <nav className="navbar navbar-expand-lg bg-white shadow-sm px-5 py-3">
        <div className="container-fluid d-flex justify-content-between align-items-center">
  
          {/* Left: Logo + Search */}
          <div className="d-flex align-items-center gap-3">
            <a href="/"><img src={logo} alt="Logo" height="32" /></a>
            <div className="position-relative">
              <FaSearch className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
              <input
                type="text"
                className="form-control ps-5 rounded-pill bg-light border-0"
                placeholder="Search for a service"
                style={{ width: '250px' }}
              />
            </div>
          </div>
  
          {/* Right: Navigation */}
          <div className="d-flex align-items-center gap-4">
  
            {/* Dynamic User Routes */}
            {userRoutes.map(({ path, label }) => (
              <a key={path} href={path} className="nav-link text-dark fw-medium">
                {label}
              </a>
            ))}
  
            {/* Profile/Login */}
            <a href="/login" className="nav-link">
              <FaUser size={18} />
            </a>
          </div>
        </div>
      </nav>
    );
  }
  