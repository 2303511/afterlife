const express = require('express');
const router = express.Router();
const sendMail = require('../utils/mailer');

const { getPaymentSummary } = require('./payment');

router.post('/sendMail', async (req, res) => {
  const { to, subject, mailContent } = req.body;

  try {
    await sendMail(
      to,
      subject, 
      mailContent
    );

    res.json({ success: true, message: 'Email sent successfully!' }); // ✅ return success
  } catch (err) {
    console.error('Email error:', err);
    res.status(500).json({ success: false, error: 'Failed to send email' });
  }
});

// to send to user on payment success
router.post('/sendReceipt', async (req, res) => {
  const { to, bookingID } = req.body; 

  let paymentSummary = await getPaymentSummary(bookingID);

  if (!paymentSummary) {
    return res.status(404).json({ error: "No payment found" });
  }
  
  const {
    // applicant and beneficiary details
    fullName, beneficiaryName, 
    
    // niche details
    blockName, levelNumber, nicheColumn, nicheRow,

    // booking details
    bookingType,

    // payment details
    amount, paymentDate
  } = paymentSummary;

  try {
    await sendMail (
      to, 
      '🧾 Your Niche Booking Receipt – AfterLife Columbarium',
      `<p>Hi ${fullName},</p>

      <p>Thank you for your booking.</p>

      <p>We have successfully received your payment and confirmed your niche reservation. Below are your booking details:</p>

      <h4>🪦 Booking Summary</h4>
      <ul>
        <li><strong>Beneficiary Name:</strong> ${beneficiaryName}</li>
        <li><strong>Niche Location:</strong> Block ${blockName}, Level ${levelNumber}, Column ${nicheColumn} – Row ${nicheRow}</li>
        <li><strong>Booking ID:</strong> ${bookingID}</li>
        <li><strong>Booking Type:</strong> ${bookingType}</li>
        <li><strong>Payment Amount:</strong> SGD ${amount}</li>
        <li><strong>Payment Date:</strong> ${paymentDate}</li>
      </ul>

      <p>If you have any questions or require further assistance, feel free to contact our support team.</p>

      <p>Warm regards,<br/>
      <strong>AfterLife Support Team</strong><br/>
      aftlifesup@gmail.com</p>`
    );

    res.json({ success: true }); // must send back success
  } catch (err) {
    console.error('Failed to send payment receipt');
    res.status(500).json({ success: false, error: "Failed to send paymnt email" });
  }
});

// for sending denied request
router.post('/sendDeniedRequest', async (req, res) => {
  const { to, reason } = req.body;

  try {
    await sendMail(
      to,
      'Your Urn Placement Request Was Rejected',
      `<p>Dear user,</p>
       <p>Your request was rejected for the following reason:</p>
       <p><strong>${reason}</strong></p>
       <p>Please update and resubmit your request if applicable.</p>`
    );

    res.json({ success: true, message: 'Email sent successfully!' }); // ✅ return success
  } catch (err) {
    console.error('Email error:', err);
    res.status(500).json({ success: false, error: 'Failed to send email' });
  }
});

// for booking
async function sendAccountCreationEmail(to, fullName, tempPassword) {
  console.log("sendAccountCreationEmail triggered for:", to);

  const subject = "Your Afterlife Account Has Been Created";
  const html = `
    <p>Hello ${fullName},</p>
    <p>An account has been created for you on Afterlife.</p>
    <p><strong>Temporary password:</strong> ${tempPassword}</p>
    <p>Please log in and change your password as soon as possible.</p>
    <p><a href="https://yourdomain.com/login">Click here to log in</a></p> 
  `;

  return sendMail(to, subject, html);
}


module.exports = {
  router,
  sendAccountCreationEmail
};
