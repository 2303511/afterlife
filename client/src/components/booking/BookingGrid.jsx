import React from 'react';
import StaffBookingCard from '../../components/booking/StaffBookingCard';

export default function BookingGrid({ title, bookings, onApprove, onDecline, onArchive, currentTab }) {
  return (
    <>
      <h3>{title}</h3>
      <div className="booking-grid">
        {bookings.map((booking, i) => (
          <StaffBookingCard
            key={i}
            booking={booking}
            currentTab={currentTab} // ✅ Pass this correctly
            onApprove={() => onApprove?.(booking.id)}
            onDecline={() => onDecline?.(booking.id)}
            onArchive={() => onArchive?.(booking.id)}
          />
        ))}
      </div>
    </>
  );
}

