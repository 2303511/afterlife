import React, { useState, useEffect } from "react";
import { Button, Form, Row, Col, Spinner } from "react-bootstrap";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import CheckoutForm from "./CheckoutForm";
import axios from "axios";

// for error toasts
import "react-toastify/dist/ReactToastify.css";

import { useNavigate } from "react-router-dom";

export default function PaymentForm({ onBack, bookingID }) {
  const navigate = useNavigate();
	const [paymentMethod, setPaymentMethod] = useState("");
	const [paymentAmount, setPaymentAmount] = useState("");
	const [stripePromise, setStripePromise] = useState(null);
	const [clientSecret, setClientSecret] = useState("");

	// when the payment method is set to card, just prepare all of the required stuff for stripe
	useEffect(() => {
		// When "Card" is selected, load Stripe client + intent
		if (paymentMethod === "Card") {
			const setupStripe = async () => {
				// 2a. this is going to ask from stripe config
				const publishableKey = await axios.get("/api/payment/config").then((res) => {
				return res.data.publishableKey;
				});
				setStripePromise(loadStripe(publishableKey));

				// 2b. to get the secret key
				const secretKey = await axios.post("/api/payment/create-payment-intent")
				.then((res) => { return res.data.clientSecret; }); // this is client secret for stripe 

				setClientSecret(secretKey);
			};

			setupStripe();
		} else {
			setStripePromise(null);
			setClientSecret("");
		}
	}, [paymentMethod]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!paymentMethod || (paymentMethod !== "Waived" && !paymentAmount)) {
			alert("Please enter both payment method and amount.");
			return;
		}

		// save the payment method within session storage
		sessionStorage.setItem("paymentMethod", paymentMethod);

		// navigate to the payment success page
		navigate(`/payment-success?bookingID=${bookingID}`);
	};

	return (
		<div className="payment-form card p-4 mt-4">
			<div className="d-flex justify-content-between align-items-center mb-3">
				<h4>Payment Details</h4>
				<Button variant="outline-secondary" onClick={onBack}>
					← Back
				</Button>
			</div>

			<Form onSubmit={handleSubmit}>
				<Row>
					<Col md={6}>
						<Form.Group className="mb-3">
							<Form.Label>Payment Method</Form.Label>
							<Form.Select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
								<option value="">Select a method</option>
								<option value="Cash">Cash</option>
								<option value="Cheque">Cheque</option>
								<option value="Card">Card</option>
								<option value="Waived">Waived</option>
							</Form.Select>
						</Form.Group>
					</Col>

					{(paymentMethod.toLowerCase() === "cash" || paymentMethod.toLowerCase() === "cheque") && (
						<Col md={6}>
							<Form.Group className="mb-3">
								<Form.Label>Amount Paid (SGD)</Form.Label>
								<Form.Control type="number" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} placeholder="0.00" min="0" step="0.01" />
							</Form.Group>
						</Col>
					)}
				</Row>

				{paymentMethod.toLowerCase() !== "card" && (
					<Button type="submit" variant="success">
						Finalize Booking
					</Button>
				)}
			</Form>

			{/* Show Stripe Elements if "Card" is selected */}
			{paymentMethod === "Card" && (
				<>
					{stripePromise && clientSecret ? (
						<Elements stripe={stripePromise} options={{ clientSecret }}>
							<CheckoutForm bookingID={bookingID} />
						</Elements>
					) : (
						<div className="text-center mt-3">
							<Spinner animation="border" size="sm" /> Loading Stripe...
						</div>
					)}
				</>
			)}
		</div>
	);
}
