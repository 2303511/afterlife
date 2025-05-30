import { FaBell, FaEnvelope } from "react-icons/fa";
import '../index.css';

export default function TopNavbar() {
  return (
    <nav className="navbar navbar-expand bg-white border-bottom px-4 py-2 d-flex justify-content-between align-items-center">
      {/* Search */}
      <form className="d-flex align-items-center" style={{ width: "300px" }}>
        <input
          className="form-control me-2"
          type="search"
          placeholder="Search..."
          aria-label="Search"
        />
        <button className="btn btn-outline-secondary" type="submit">
          Search
        </button>
      </form>

      {/* Icons and Profile */}
      <div className="d-flex align-items-center gap-3">
        {/* Notifications */}
        <div className="position-relative">
          <FaBell size={20} className="text-muted" />
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
            3
          </span>
        </div>

        {/* Messages */}
        <div className="position-relative">
          <FaEnvelope size={20} className="text-muted" />
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-primary">
            5
          </span>
        </div>

        {/* Profile */}
        <div className="d-flex align-items-center">
          <img
            src="https://via.placeholder.com/36"
            alt="User"
            className="rounded-circle me-2"
            width="36"
            height="36"
          />
          <span className="fw-semibold text-dark">John Doe</span>
        </div>
      </div>
    </nav>
  );
}
