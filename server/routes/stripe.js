const express = require("express");
const router = express.Router();
const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY); // use dotenv!

router.get("/config", (req, res) => {
	res.send({
		publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
	});
});

router.post("/create-payment-intent", async (req, res) => {
	const paymentAmount = req.body.amount * 100; // stripe always takes in the value in cents.hence need to *100

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

module.exports = router;
