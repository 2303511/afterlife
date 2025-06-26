import { Link, useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import axios from "axios";

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import logo from "../img/logo.svg";
import "../styles/AfterLife-Theme.css";

export default function PaymentSuccess() {
	const [searchParams] = useSearchParams();
	
	useEffect(() => {
		const updateTransaction = async () => {
			// if there is no payment made, immediately redirect
			if (!searchParams.get("bookingID")) {
				window.location.href = "/my-bookings";
			} else {
				const bookingID = searchParams.get("bookingID");
				console.log("Booking ID from URL:", bookingID);

				try {
					const res = await axios.post("/api/booking/updateBookingTransaction", {
						paymentMethod: "Credit Card",
						paymentAmount: 100, //TODO PUT DYNAMIC VALUES LTR
						bookingID
					});

					if (!res.data.success) {
						toast.error("Failed to update transaction.");
					}
				} catch (err) {
					console.error("Error updating transaction:", err);
					toast.error("Server error while updating transaction.");
				}
			}
		};

		updateTransaction();
	}, []);

	return (
		<>
			<section className="hero-gradient py-5 min-vh-100 d-flex align-items-center">
				<div className="container text-center py-5">
					<img src={logo || "https://via.placeholder.com/80x80/6c757d/ffffff?text=AL"} alt="AfterLife logo" className="mb-4 rounded-circle shadow" style={{ width: "80px", height: "80px" }} />
					<h1 className="display-3 fw-bold text-success mb-3">✅ Payment Successful</h1>
					<h2 className="display-5 fw-semibold text-dark mb-4">Thank you for your booking!</h2>
					<p className="text-muted lead mb-5 px-3">
						We have received your payment. A confirmation email will be sent to you shortly.
						<br />
						You can return to your bookings page or back to the homepage.
					</p>
					<div className="d-flex justify-content-center gap-3">
						<Link to="/my-bookings">
							<button className="btn btn-success btn-lg rounded-pill px-5">📄 View My Bookings</button>
						</Link>
						<Link to="/">
							<button className="btn btn-outline-secondary btn-lg rounded-pill px-5">🏠 Back to Home</button>
						</Link>
					</div>
				</div>
			</section>
		</>
	);
}
