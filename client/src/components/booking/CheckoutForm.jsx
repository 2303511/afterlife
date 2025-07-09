import React, { useState } from "react";
import { useStripe, useElements } from "@stripe/react-stripe-js";
import { Button } from "react-bootstrap";

// import payment elements
import { PaymentElement } from "@stripe/react-stripe-js";

import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function CheckoutForm(
  { 
    onBack,
    bookingID
  }) {
  // import stripe elements
  const stripe = useStripe();
  const elements = useElements();

	const [isProcessing, setIsProcessing] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();

    if (!stripe || !elements) {
      return; // dont do anything if not initialised
    }

    setIsProcessing(true); // wait for the user to complete payment

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment-success?bookingID=${bookingID}` // place to redirect user to the success page
      },
    });

    if (error) {
      toast.error(error.message);
      // setMessage(error.message);
    }
    
    setIsProcessing(false);
	};

	return (
    <>
      <div className="container p-3 mt-4">
        <h3>Payment</h3>
        <Button variant="outline-secondary" onClick={onBack}>
					← Back
				</Button>
        <form id="payment-form" className="payment-form mt-4" onSubmit={handleSubmit}>
          <PaymentElement />
          <button className="btn btn-elegant btn-md px-3 my-3" disabled={isProcessing} id="submit">
            <span id="button-text">{isProcessing ? "Processing..." : "Proceed Payment"}</span>
          </button>

        </form>
      </div>
    </>

	);
}
