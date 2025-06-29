import React from "react";

export default function NicheLegend({ statusClass }) {
  return (
    <>
      <div className="d-flex justify-content-center flex-wrap gap-3 mb-3">
        {Object.entries(statusClass).map(([status, className]) => (
          <div className="d-flex align-items-center" key={status}>
            <div className={`legend-box ${className} me-2`} />
            <small className="text-capitalize">{status}</small>
          </div>
        ))}
      </div>
      {/* Centered label for column-row */}
      <p className="text-center fw-medium">Niche Format: Column - Row</p>
    </>
  );
}
