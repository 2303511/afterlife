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
