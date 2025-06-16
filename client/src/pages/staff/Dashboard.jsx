import { useEffect, useState } from "react";
import StatCard from "../../components/staffDashboard/StatCard";
import "../../styles/Dashboard.css";
import axios from 'axios';

export default function Dashboard() {
  const [statsData, setStatsData] = useState({
    totalBookings: 0,
    pendingApproval: 0,
    returningClients: 0,
    nicheStatuses: []
  });

  useEffect(() => {
    axios.get("http://localhost:8888/api/dashboard/stats")
      .then(res => {
        setStatsData(res.data);
      })
      .catch(err => {
        console.error("Failed to load dashboard stats:", err);
      });
  }, []);

  const statusColorMap = {
    Available: "text-success",
    Reserved: "text-warning",
    Occupied: "text-danger",
    Pending: "text-primary",
    Blocked: "text-muted"
  };

  const stats = [
    { label: "Total Bookings", value: statsData.totalBookings.toLocaleString(), color: "" },
    { label: "Pending Approval", value: statsData.pendingApproval.toString(), color: "text-danger" },
    { label: "Returning Clients", value: `${statsData.returningClients}%`, color: "", trend: "down" },
    ...((statsData.nicheStatuses || []).map((status) => ({
      label: `${status.status} Niches`,
      value: status.count.toString(),
      color: statusColorMap[status.status] || ""
    })))
  ];

  return (
    <div className="dashboard">
      <h1 className="fw-bold">Dashboard</h1>
      <p className="text-muted">Welcome Back!</p>

      <div className="row mb-4">
        {stats.map((stat, i) => (
          <div className="col-md-3 mb-3" key={i}>
            <StatCard {...stat} />
          </div>
        ))}
      </div>
    </div>
  );
}
