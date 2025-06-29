const nodemailer = require('nodemailer');
require('dotenv').config();

console.log("MAIL_USER:", process.env.MAIL_USER);
console.log("MAIL_PASS:", process.env.MAIL_PASS ? '[OK]' : '[MISSING]');

const transporter = nodemailer.createTransport({
  service: process.env.MAIL_SERVICE, // 'gmail'
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

// Generic function to send email
async function sendMail(to, subject, htmlContent) {
  const mailOptions = {
    from: `"AfterLife Admin" <${process.env.MAIL_USER}>`,
    to,
    subject,
    html: htmlContent
  };

  return transporter.sendMail(mailOptions);
}

module.exports = sendMail;
