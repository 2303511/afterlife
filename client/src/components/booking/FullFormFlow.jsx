import React, { useState, useEffect, useRef } from "react";

import axios from "axios";
import "../../styles/Niche-Management.css";

import BookingForm from "./BookingForm";
import PaymentForm from "./PaymentForm";

// dynamically get the screen size
import { useResizeDetector } from 'react-resize-detector';

export default function FullFormFlow({ selectedSlot }) {
	const [step, setStep] = useState("booking"); // or 'payment'
	const [bookingFormData, setBookingFormData] = useState(null);

	// get the form width
	const { ref, width = 0 } = useResizeDetector();
	console.log(`in full form, width is ${width}`);

	// handlers
	function formDataToJson(formData) {
		const json = {};
		for (let [key, value] of formData.entries()) {
			json[key] = value;
		}
		return json;
	}

	const handleSubmit = async (paymentData) => {
		if (!bookingFormData || !selectedSlot) {
			console.error("Missing form or slot data");
			return;
		}

		const formJson = formDataToJson(bookingFormData);

		const fullPayload = {
			...formJson,
			paymentMethod: paymentData.method,
			paymentAmount: paymentData.amount,
			nicheID: selectedSlot.nicheID
		};

		try {
			const res = await axios.post("/api/booking/submitStaffBooking", fullPayload, { headers: { "Content-Type": "application/json" } });

			if (res.data.success) {
				alert(`Booking submitted! Booking ID: ${res.data.bookingID}`);

				// reset states
				setStep("booking");
				setBookingFormData(null);

				// redirect to booking page
				// TODO: REDIRECT TO my-bookings
			} else if (res.data.errors) {
				console.error("Validation errors:", res.data.errors);
				alert("Validation errors — please check the form.");
				setStep("booking"); // Go back to form
			}
		} catch (err) {
			if (err.response && err.response.status === 400) {
				// Backend sent validation errors
				console.error("Validation errors:", err.response.data.errors);
				alert("Validation errors — please check the form.");
				setStep("booking");
			} else {
				console.error("Booking failed:", err);
				alert("Server error — failed to submit booking.");
			}
		}
	};

	return (
		<>
			<div ref={ref}>
				{step === "booking" && (
					<BookingForm
						selectedSlot={selectedSlot}
						onSubmit={(formData) => {
							setBookingFormData(formData); // temporarily store data
							setStep("payment"); // go to payment step
						}}
						isModal={false}
						width={width}
					/>
				)}
			</div>

			{step === "payment" && (
				<PaymentForm
					onBack={() => setStep("booking")}
					onSubmit={handleSubmit} // real DB submission happens here
				/>
			)}
		</>
	);
}
