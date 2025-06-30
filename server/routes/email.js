// routes/email.js

const express = require('express');
const router  = express.Router();
const sendMail = require('../utils/mailer');
const { getPaymentSummary } = require('./payment');
const { ensureAuth, ensureRole } = require('../middleware/auth.js');

// Generic sendMail (staff/admin only)
router.post('/sendMail',
  ensureAuth,
  ensureRole(['staff','admin']),
  async (req, res) => {
    const { to, subject, mailContent } = req.body;
    try {
      await sendMail(to, subject, mailContent);
      res.json({ success: true, message: 'Email sent successfully!' });
    } catch (err) {
      console.error('Email error:', err);
      res.status(500).json({ success: false, error: 'Failed to send email' });
    }
  }
);

// Send booking receipt (authenticated users only)
router.post('/sendReceipt',
  ensureAuth,
  async (req, res) => {
    const { to, bookingID } = req.body;
    let paymentSummary = await getPaymentSummary(bookingID);
    if (!paymentSummary) {
      return res.status(404).json({ error: "No payment found" });
    }

    const {
      fullName,
      beneficiaryName,
      blockName,
      levelNumber,
      nicheColumn,
      nicheRow,
      bookingType,
      amount,
      paymentDate
    } = paymentSummary;

    const subject = '🧾 Your Niche Booking Receipt – AfterLife Columbarium';
    const html = `
      <p>Hi ${fullName},</p>
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
      <p>Warm regards,<br/><strong>AfterLife Support Team</strong><br/>aftlifesup@gmail.com</p>
    `;
    try {
      await sendMail(to, subject, html);
      res.json({ success: true });
    } catch (err) {
      console.error('Failed to send payment receipt', err);
      res.status(500).json({ success: false, error: 'Failed to send payment email' });
    }
  }
);

// Send denial notification (staff/admin only)
router.post('/sendDeniedRequest',
  ensureAuth,
  ensureRole(['staff','admin']),
  async (req, res) => {
    const { to, reason } = req.body;
    const subject = 'Your Urn Placement Request Was Rejected';
    const html = `
      <p>Dear user,</p>
      <p>Your request was rejected for the following reason:</p>
      <p><strong>${reason}</strong></p>
      <p>Please update and resubmit your request if applicable.</p>
    `;
    try {
      await sendMail(to, subject, html);
      res.json({ success: true, message: 'Email sent successfully!' });
    } catch (err) {
      console.error('Email error:', err);
      res.status(500).json({ success: false, error: 'Failed to send email' });
    }
  }
);

// Send password reset link (public)
router.post('/sendResetPassword', async (req, res) => {
  const { to, link } = req.body;
  const subject = 'Password reset';
  const html = `
    <p>Dear user,</p>
    <p>Sorry to hear you’re having trouble logging into AfterLife. We got a message that you forgot your password.</p>
    <p>If this was you, you can reset your password using this link:</p>
    <p>${link}</p>
    <p>If you didn’t request a login link or a password reset, you can ignore this message.</p>
  `;
  try {
    await sendMail(to, subject, html);
    res.json({ success: true, message: 'Email sent successfully!' });
  } catch (err) {
    console.error('Email error:', err);
    res.status(500).json({ success: false, error: 'Failed to send email' });
  }
});

// For booking-account creation
async function sendAccountCreationEmail(to, fullName, tempPassword) {
  const subject = "Your Afterlife Account Has Been Created";
  const html = `
    <p>Hello ${fullName},</p>
    <p>An account has been created for you on AfterLife.</p>
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
