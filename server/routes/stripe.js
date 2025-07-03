const express = require("express");
const router = express.Router();
const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY); // use dotenv!

const { ensureAuth } = require("../middleware/auth.js");

router.get("/config", ensureAuth, (req, res) => {
	res.send({
		publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
	});
});

router.post("/create-payment-intent", ensureAuth, async (req, res) => {
    const paymentAmount = process.env.PAYMENT_AMOUNT * 100;
	// const paymentAmount = req.body.amount * 100; // stripe always takes in the value in cents.hence need to *100

	try {
		const paymentIntent = await stripe.paymentIntents.create({
			currency: "SGD",
			amount: paymentAmount, // bookingData.amount,
			automatic_payment_methods: {
				enabled: true // automate the kinds of payment methods u wanna use, can access through the dashboard
			}
		});

		res.send({ clientSecret: paymentIntent.client_secret }); // Stripe Checkout URL
	} catch (e) {
		return res.status(400).send({
			error: {
				message: e.message
			}
		});
	}
});

// TODO: XH REMEMBER THIS
router.post("/webhook", express.raw({ type: "application/json" }), (req, res) => {
    const sig = req.headers["stripe-signature"];

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_SECRET_KEY);
    } catch (err) {
        console.error("Webhook signature verification failed:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // ✅ Handle event types here:
    if (event.type === "payment_intent.succeeded") {
        const paymentIntent = event.data.object;

        console.log("🎉 PaymentIntent succeeded:", paymentIntent.id);

        const methodTypes = paymentIntent.payment_method_types; // e.g. ["card"] or ["paynow"]
        console.log("Payment method types:", methodTypes);

        const charge = paymentIntent.charges.data[0];

        // Example: if card was used
        if (charge.payment_method_details.card) {
            console.log("Card brand:", charge.payment_method_details.card.brand);
            console.log("Card last4:", charge.payment_method_details.card.last4);
        }

        // Example: if paynow was used
        if (charge.payment_method_details.paynow) {
            console.log("PayNow ref:", charge.payment_method_details.paynow.reference_number);
        }

        // TODO: ✅ Save booking to DB here
    }

    // ✅ Always respond to Stripe:
    res.status(200).json({ received: true });
});

module.exports = router;
