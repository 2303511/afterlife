// src/pages/AdminDashboard.jsx

import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../auth/AuthContext";

export default function AdminDashboard() {
  const { user, loading } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    axios
      .get("/api/dashboard/stats", { withCredentials: true })
      .then((res) => setStats(res.data))
      .catch(() => setError("Failed to load dashboard stats"));
  }, [user]);

  if (loading || !user) return <div>Loading...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!stats) return null;

  return (
    <div className="container mt-4">
      <h1>Admin Dashboard</h1>
      <div className="row">
        <div className="col-md-4">
          <div className="card p-3">
            <h5>Total Bookings</h5>
            <p className="display-4">{stats.totalBookings}</p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card p-3">
            <h5>Pending Niches</h5>
            <p className="display-4">{stats.pendingApproval}</p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card p-3">
            <h5>Returning Clients (%)</h5>
            <p className="display-4">{stats.returningClients}%</p>
          </div>
        </div>
      </div>

      <h3 className="mt-5">Niche Status Breakdown</h3>
      <ul className="list-group">
        {stats.nicheStatuses.map(({ status, count }) => (
          <li key={status} className="list-group-item d-flex justify-content-between">
            {status}
            <span className="badge bg-primary">{count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
