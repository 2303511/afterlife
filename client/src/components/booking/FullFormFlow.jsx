import React, { useState, useEffect, useRef } from "react";

import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

import axios from "axios";
import "../../styles/Niche-Management.css";

import BookingForm from "./BookingForm";
import PaymentForm from "./PaymentForm";
import CheckoutForm from "./CheckoutForm";

// dynamically get the screen size
import { useResizeDetector } from "react-resize-detector";

export default function FullFormFlow({ selectedSlot }) {
	const [step, setStep] = useState("booking"); // or 'payment'
	const [bookingFormData, setBookingFormData] = useState(null);
	const [stripePromise, setStripePromise] = useState(null);
	const [clientSecret, setClientSecret] = useState("");

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

	const handleStripePayment = async () => {
		// this is going to ask from stripe config
		const publishableKey = await axios.get("/api/payment/config").then((res) => {
			return res.data.publishableKey;
		});
		console.log(publishableKey);
		setStripePromise(loadStripe(publishableKey));

		// to get the secret key
		const secretKey = await axios
			.post("/api/payment/create-payment-intent", {
				amount: 100 // TODO: UPDATE THE PRICE OF THE NICHE
			})
			.then((res) => {
				return res.data.clientSecret; // this is client secret
			});
		console.log(secretKey);
		setClientSecret(secretKey);
	};

	return (
		<>
			<div ref={ref}>
				{step === "booking" && (
					<BookingForm
						selectedSlot={selectedSlot}
						onSubmit={(formData) => {
							setBookingFormData(formData); // temporarily store data

							if (sessionStorage.getItem("role") === "user") handleStripePayment();
							setStep("payment"); // go to payment step
						}}
						isModal={false}
						width={width}
					/>
				)}
			</div>

			{step === "payment" && sessionStorage.getItem("role") === "staff" && (
				<PaymentForm
					onBack={() => setStep("booking")}
					onSubmit={handleSubmit} // real DB submission happens here
				/>
			)}
			{step === "payment" && sessionStorage.getItem("role") === "user" && !!stripePromise && !!clientSecret && (
				<Elements stripe={stripePromise} options={{ clientSecret }}>
					<CheckoutForm 
						onComplete={handleSubmit}
					/>
				</Elements>
			)}
		</>
	);
}
