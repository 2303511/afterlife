import React from "react";

export default function NicheGrid({ slots, statusClass, onSlotClick, selectedSlotId, numRows, numCols }) {

  return (
    <div className="grid-wrapper">

      {[...Array(numRows)].map((_, row) => (
        <div className="d-flex" key={`row-${row}`}>
          {[...Array(numCols)].map((_, col) => {
            const nicheRow = row + 1;
            const nicheColumn = col + 1;

            const slot = slots.find(
              (s) => s.nicheRow === nicheRow && s.nicheColumn === nicheColumn
            );
            const status = slot ? slot.status.toLowerCase() : "empty";
            const isSelected = slot && slot.id === selectedSlotId;

            return (
              <div
                key={`cell-${row}-${col}`}
                className={`slot-box ${statusClass[status] || "status-empty"} ${isSelected ? "selected" : ""}`}
                onClick={() => slot && onSlotClick(slot)}
                title={slot?.nicheCode || `Row ${nicheRow}, Col ${nicheColumn}`}
              >
                <small>{`${nicheColumn}-${nicheRow}`}</small>

              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
