const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

exports.getStripeConfig = (req, res) => {
  res.send({ publishableKey: process.env.STRIPE_PUBLISHABLE_KEY });
};

exports.createPaymentIntent = async (req, res) => {
  const paymentAmount = process.env.PAYMENT_AMOUNT * 100;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      currency: "SGD",
      amount: paymentAmount,
      automatic_payment_methods: { enabled: true }
    });

    res.send({ clientSecret: paymentIntent.client_secret });
  } catch (e) {
    res.status(400).send({ error: { message: e.message } });
  }
};

exports.handleStripeWebhook = (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_SECRET_KEY);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;
    console.log("🎉 PaymentIntent succeeded:", paymentIntent.id);

    const charge = paymentIntent.charges.data[0];
    const methodDetails = charge.payment_method_details;

    if (methodDetails.card) {
      console.log("Card brand:", methodDetails.card.brand);
      console.log("Card last4:", methodDetails.card.last4);
    }

    if (methodDetails.paynow) {
      console.log("PayNow ref:", methodDetails.paynow.reference_number);
    }

    // TODO: save booking/payment record to DB
  }

  res.status(200).json({ received: true });
};
