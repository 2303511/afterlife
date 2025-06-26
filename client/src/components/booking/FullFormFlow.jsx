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

export default function FullFormFlow({ selectedSlot, onCancel }) {
	const [step, setStep] = useState("booking"); // or 'payment'
	const [bookingFormData, setBookingFormData] = useState(null);
	const [stripePromise, setStripePromise] = useState(null);
	const [clientSecret, setClientSecret] = useState("");
	const [bookingID, setBookingID] = useState("");

	// get the form width
	const { ref, width = 0 } = useResizeDetector();

	// handlers
	function formDataToJson(formData) {
		const json = {};
		for (let [key, value] of formData.entries()) {
			json[key] = value;
		}
		return json;
	}

	const handleSubmit = async (bookingFormData) => {
		if (!bookingFormData || !selectedSlot) {
			console.error("Missing form data");
			return;
		}
		if (!selectedSlot) {
			console.error("Missing slot data");
			return;
		}

		try {
			const res = await axios.post("/api/booking/submitBooking", bookingFormData,  { headers: { 'Content-Type': 'multipart/form-data' } }); // save to db

			if (res.data.success) {
				// 1. save the bookingID
				let newBookingID = res.data.bookingID;
				setBookingID(newBookingID);

				console.log("Booking confirmed! Now fetching Stripe keys...");

				// 2. this is going to ask from stripe config
				const publishableKey = await axios.get("/api/payment/config").then((res) => {
					return res.data.publishableKey;
				});
				console.log(publishableKey);
				setStripePromise(loadStripe(publishableKey));

				// 3. to get the secret key
				const secretKey = await axios
					.post("/api/payment/create-payment-intent", {
						amount: 100, // TODO: UPDATE THE PRICE OF THE NICHE
						bookingFormData: bookingFormData
					})
					.then((res) => {
						return res.data.clientSecret; // this is client secret
					});
				console.log(secretKey);
				setClientSecret(secretKey);

				// 4. finally move to payment step:
				setStep("payment");
			} else if (res.data.errors) {
				console.error("Validation errors:", res.data.errors);
				alert("Validation errors — please check the form.");
				setStep("booking"); // Go back to form
			}
		} catch (err) {
			if (err.response && err.response.status === 400) {
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
						onSubmit={async (formData) => {
							setBookingFormData(formData); // temporarily store data

							await handleSubmit(formData); // push other details to database first
							setStep("payment"); // go to payment step
						}}
						isModal={false}
						width={width}
						onCancel={onCancel}
					/>
				)}
			</div>
			{step === "payment" &&
				(sessionStorage.getItem("role") === "staff" ? (
					<PaymentForm onBack={() => setStep("booking")} onSubmit={handleSubmit} />
				) : (
					!!stripePromise &&
					!!clientSecret && (
						<Elements stripe={stripePromise} options={{ clientSecret }}>
							<CheckoutForm bookingID={bookingID} />
						</Elements>
					)
				))}
			;
		</>
	);
}
