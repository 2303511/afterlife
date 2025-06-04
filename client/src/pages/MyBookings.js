// src/pages/MyBookings.js
import React, { useEffect, useState } from "react";

export default function MyBookings() {
	const [bookings, retrievedBookings] = useState([]);
    // booking holds fetched data, retrievedBookings is a function to update the bookings state

	useEffect(() => {
		fetch("/api/bookings", {
			method: "GET",
			headers: {
				"Content-Type": "application/json"
				// Add any authentication headers if needed
				// 'Authorization': `Bearer ${token}`
			},
			body: JSON.stringify({
				userId: '12345' // current user id
			})
		})
			.then((res) => res.json())
			.then((data) => {
				retrievedBookings(data);
			})
			.catch((err) => {
				console.error("Failed to fetch bookings:", err);
			});
	}, []);

    if (bookings.length === 0) {
        return <p>No bookings found.</p>;
    } else if (bookings.length > 0) {
        return (
            <div>
                <h1>My Bookings</h1>
                <ul>
                    {bookings.map((booking) => (
                        <li key={booking.bookingId}>
                            Booking ID: {booking.bookingId}, Date: {booking.date}, Status: {booking.status}
                        </li>
                    ))}
                </ul>
            </div>
        );
    } else {
        // This case should not happen, but it's good to handle it
        return <p>Loading bookings...</p>;
    }
}