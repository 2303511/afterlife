const express = require('express');
const router = express.Router();
const sendMail = require('../utils/mailer');

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

router.post('/sendResetPassword', async (req, res) => {
  const { to, link } = req.body;

  try {
    await sendMail(
      to,
      'Password reset',
      `<p>Dear user,</p>
      <p>Sorry to hear you’re having trouble logging into AfterLife. We got a message that you forgot your password.</p>
      <p>If this was you, you can reset your password using this link:</p>
      <p>${link}</p>
      <p>If you didn’t request a login link or a password reset, you can ignore this message.</p>`
    );

    res.json({ success: true, message: 'Email sent successfully!' });
  } catch (err) {
    console.error('Email error:', err);
    res.status(500).json({ success: false, error: 'Failed to send email' });
  }
});


module.exports = router;
