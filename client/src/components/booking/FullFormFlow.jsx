import { useState, useEffect } from "react";

import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

import axios from "axios";
import "../../styles/AfterLife-Theme.css";

import BookingForm from "./BookingForm";
import PaymentForm from "./PaymentForm";
import CheckoutForm from "./CheckoutForm";

// dynamically get the screen size
import { useResizeDetector } from "react-resize-detector";

// for error toasts
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { retrieveSession } from "../../utils/retrieveSession";

export default function FullFormFlow({ selectedSlot, onCancel, setIsBookButtonDisabled, setIsForm }) {
	const [step, setStep] = useState("booking"); // or 'payment'
	const [bookingFormData, setBookingFormData] = useState(null);
	const [stripePromise, setStripePromise] = useState(null);
	const [clientSecret, setClientSecret] = useState("");
	const [bookingID, setBookingID] = useState("");

	// get the form width
	const { ref, width = 0 } = useResizeDetector();

	// for user session
	const [user, setUser] = useState(undefined);
	useEffect(() => {
		const init = async () => {
			let currentUser = await retrieveSession();

			if (!!currentUser) setUser(currentUser)
			else {
				toast.error(`Failed to find user in session`);
				return null
			}

			//let res_user = await axios.get(`/api/user/getUserByID?userID=${currentUser.userID}`);	
		}
		init();
	}, []);

	// handlers
	const handleSubmit = async (bookingFormData) => {
		if (!bookingFormData) {
			toast.error("Missing form data");
			return;
		}
		if (!selectedSlot) {
			toast.error("Missing slot data");
			return;
		}

		await bookingFormData.append("paidByID", user?.userID);

		try {
			const res = await axios.post("/api/booking/submitBooking", bookingFormData, { headers: { "Content-Type": "multipart/form-data" } }); // save to db

			if (res.data.success) {
				// 1. save the bookingID
				let newBookingID = res.data.bookingID;
				setBookingID(newBookingID);

				console.log("Booking confirmed! Now fetching Stripe keys...");

				// 2. FETCH STRIPE KEYS !
				if (user?.role === "user") await handleCard();

				// 3. finally move to payment step:
				setStep("payment");
			} else if (res.data.errors) {
				(res.data.errors || []).forEach((err) => {
					toast.error(err);
				});

				setStep("booking"); // ensure that the steps remains on booking, do not proceeed to payment
			}
		} catch (err) {
			if (err.response && err.response.status === 400) {
				// eslint-disable-next-line
				for (const [key, value] of Object.entries(err.response.data.errors)) {
					toast.error(value);
				}
				setStep("booking"); // ensure that the steps remains on booking, do not proceeed to payment
			} else {
				toast.error(`Booking failed: ${err}`);
			}
		}
	};

	const handleCard = async () => {
		// 2a. this is going to ask from stripe config
		const publishableKey = await axios.get("/api/payment/config").then((res) => {
			return res.data.publishableKey;
		});
		console.log(publishableKey);
		setStripePromise(loadStripe(publishableKey));

		// 2b. to get the secret key
		const secretKey = await axios
			.post("/api/payment/create-payment-intent")
			.then((res) => {
				return res.data.clientSecret; // this is client secret for stripe
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
						onSubmit={async (formData, applicantData) => {
							sessionStorage.setItem("userEmail", applicantData.email);
							setBookingFormData(formData); // temporarily store data
							await handleSubmit(formData); // push other details to database first
						}}
						isModal={false}
						width={width}
						onCancel={onCancel}
					/>
				)}
			</div>
			{step === "payment" &&
				(user?.role === "staff" ? (
					// display the option for cash, cheque, or card
					<PaymentForm
						onBack={async () => {
							setStep("booking");
							await axios.post("/api/booking/delete-draft-booking", {bookingID});
						}}
						bookingID={bookingID}
					/>
				) : (
					!!stripePromise &&
					!!clientSecret && (
						<Elements stripe={stripePromise} options={{ clientSecret }}>
							<CheckoutForm 
							bookingID={bookingID} 
							onBack = {async () => {
								setStep("booking");
								await axios.post("/api/booking/delete-draft-booking", {bookingID});
							}} />
						</Elements>
					)
				))}
		</>
	);
}
