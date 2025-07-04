import React, { useEffect, useState } from "react";
import BookingGrid from "../../components/booking/BookingGrid";
import axios from "axios";
import { toast } from "react-toastify";

export default function PendingApprovals() {
	const [pendingBookings, setPendingBookings] = useState([]);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		setIsLoading(true);
		axios
			.get("/api/booking/pending", { withCredentials: true })
			.then((res) => {
				//console.log('Pending approvals:', res.data);
				setPendingBookings(res.data);
			})
			.catch((err) => {
				//console.error('Failed to load pending approvals:', err);
				toast.error("Failed to load pending approvals — please try again.");
			})
			.finally(() => {
				setIsLoading(false);
			});
	}, []);

	const onArchive = (bookingID, nicheID) => {
		axios
			.post(
				"/api/booking/archive",
				{ bookingID, nicheID },
				{ withCredentials: true }
			)
			.then(() => {
				setPendingBookings(bs => bs.filter(b => b.bookingID !== bookingID));
				toast.success("Booking archived successfully!");
			})
			.catch(() => {
				toast.error("Failed to archive booking — please try again.");
			});
	};

  return (
		<div className="pending-approvals container mt-4">
			<h1>Pending Approvals</h1>
			<p className="subtitle">All bookings pending approval</p>

			{isLoading && <div className="loading">Loading pending approvals...</div>}

			{!isLoading && pendingBookings.length === 0 && <div className="no-results">No pending bookings found.</div>}

			{!isLoading && pendingBookings.length > 0 && (
				<BookingGrid
					currentTab="pending"
					bookings={pendingBookings}
					onArchive={onArchive}
					// You can pass your approve/archive handlers here if needed
				/>
			)}
		</div>
	);
}
