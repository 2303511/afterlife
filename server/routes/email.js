const express = require('express');
const router = express.Router();
const sendMail = require('../utils/mailer');

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


module.exports = router;
