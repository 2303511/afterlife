import React from "react";

export default function NicheGrid({ slots, statusClass, onSlotClick }) {
  return (
    <div className="grid-wrapper">
      {[...Array(8)].map((_, row) => (
        <div className="d-flex" key={`row-${row}`}>
          {[...Array(10)].map((_, col) => {
            const slot = slots.find(
              (s) => s.nicheRow === row + 1 && s.nicheColumn === col + 1
            );
            const status = slot ? slot.status.toLowerCase() : "available";

            return (
              <div
                key={`col-${col}`}
                className={`slot-box ${statusClass[status]}`}
                onClick={() => onSlotClick(slot)}
                title={slot?.niche_code || `Row ${row + 1}, Col ${col + 1}`}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
