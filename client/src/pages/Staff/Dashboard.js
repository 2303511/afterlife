import { useEffect } from "react";
import StatCard from "../../components/StatCard";
import BookingCard from "../../components/BookingCard";
import "../../styles/Dashboard.css";

export default function Dashboard() {
  useEffect(() => {
    fetch("/api/")
      .then((res) => res.text())
      .then((data) => {
        console.log("API Response:", data);
      })
      .catch((err) => {
        console.error("API call failed:", err);
      });
  }, []);

  const stats = [
    { label: "Total Bookings", value: "28,345", color: "" },
    { label: "Pending Approval", value: "120", color: "text-danger" },
    { label: "New Clients this month", value: "89", color: "", trend: "up" },
    { label: "Returning Clients", value: "46%", color: "", trend: "down" }
  ];

  const bookings = [
    { name: "Amanda Chavez", service: "Physiotherapy", date: "25 Jul 2020", time: "11:00 - 12:00" },
    { name: "Fionna Wade", service: "Physiotherapy", date: "25 Jul 2020", time: "11:00 - 12:00" },
    { name: "Beatrice Carrol", service: "Physiotherapy", date: "25 Jul 2020", time: "11:00 - 12:00" },
    { name: "Jasmine Palmer", service: "Physiotherapy", date: "25 Jul 2020", time: "11:00 - 12:00" },
    { name: "Randy Elliot", service: "Physiotherapy", date: "25 Jul 2020", time: "11:00 - 12:00" },
    { name: "Christine Powell", service: "Physiotherapy", date: "25 Jul 2020", time: "11:00 - 12:00" },
  ];

  return (
    <div className="dashboard">
      <h1 className="fw-bold">Dashboard</h1>
      <p className="text-muted">Welcome Back!</p>

      <div className="row mb-4">
        {stats.map((stat, i) => (
          <div className="col-md-3" key={i}>
            <StatCard {...stat} />
          </div>
        ))}
      </div>

      <div className="tabs d-flex gap-4 mb-3">
        <span className="active-tab">Bookings</span>
        <span>Enquiries</span>
        <span>My Services</span>
      </div>

      <div className="row">
        {bookings.map((b, i) => (
          <div className="col-md-4 mb-3" key={i}>
            <BookingCard {...b} />
          </div>
        ))}
      </div>
    </div>
  );
}
