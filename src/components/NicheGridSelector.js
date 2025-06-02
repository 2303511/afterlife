import React, { useState } from "react";
import "./NicheGridSelector.css";

const statusClass = {
  available: "status-available",
  selected: "status-selected",
  occupied: "status-occupied",
  reserved: "status-reserved",
  booked: "status-booked",
  blocked: "status-blocked",
};

// Initial special statuses
const initialSlots = [
  { id: "A3-1-1", row: 1, col: 1, status: "occupied" },
  { id: "A3-1-2", row: 1, col: 2, status: "available" },
  { id: "A3-1-3", row: 1, col: 3, status: "reserved" },
  { id: "A3-2-1", row: 2, col: 1, status: "booked" },
  { id: "A3-2-2", row: 2, col: 2, status: "blocked" },
];

// Generate full grid (10x17), using initialSlots for overrides
const generateGrid = () => {
  const grid = [];
  for (let r = 1; r <= 10; r++) {
    for (let c = 1; c <= 17; c++) {
      const found = initialSlots.find((s) => s.row === r && s.col === c);
      grid.push(
        found || {
          id: `A3-${r}-${c}`,
          row: r,
          col: c,
          status: "available",
        }
      );
    }
  }
  return grid;
};

export default function NicheGridSelector() {
  const [slots, setSlots] = useState(generateGrid());

  const handleClick = (clickedSlot) => {
    if (!clickedSlot) return;

    setSlots((prevSlots) =>
      prevSlots.map((slot) => {
        if (slot.id === clickedSlot.id) {
          if (slot.status === "available") return { ...slot, status: "selected" };
          if (slot.status === "selected") return { ...slot, status: "available" };
        }
        return slot;
      })
    );
  };

  return (
    <div className="container mt-4">
      <h4>Booking Details</h4>
      <p>You are now viewing Level 3, Block A, Front Block</p>

      <div className="grid-wrapper">
        {[...Array(10)].map((_, row) => (
          <div className="d-flex" key={`row-${row}`}>
            {[...Array(17)].map((_, col) => {
              const slot = slots.find(
                (s) => s.row === row + 1 && s.col === col + 1
              );
              const status = slot.status;

              return (
                <div
                  key={`col-${col}`}
                  className={`slot-box ${statusClass[status]}`}
                  onClick={() =>
                    (status === "available" || status === "selected") && handleClick(slot)
                  }
                  title={slot.id}
                />
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="d-flex flex-wrap mt-3 gap-2">
        {Object.entries(statusClass).map(([status, className]) => (
          <div className="d-flex align-items-center me-3" key={status}>
            <div className={`legend-box ${className} me-2`} />
            <small className="text-capitalize">{status}</small>
          </div>
        ))}
      </div>
    </div>
  );
}
