import React from "react";

export default function BookingCard({ name, service, date, time }) {
    return (
      <div className="card p-3 shadow-sm booking-card">
        <h6 className="fw-bold">{name}</h6>
        <div className="text-muted">Service: {service}</div>
        <div className="text-muted">Date: {date}</div>
        <div className="text-muted mb-2">Time: {time}</div>
        <div className="d-flex gap-2">
          <button className="btn btn-link p-0 text-primary">Accept Booking</button>
          <button className="btn btn-link p-0 text-muted">Decline</button>
        </div>
      </div>
    );
  }
  