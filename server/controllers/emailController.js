const db = require("../db");
const crypto = require("crypto");
const sendMail = require("../utils/mailer");
const { getPaymentSummary } = require("./paymentController");

// Generic sendMail
exports.sendGenericMail = async (req, res) => {
  const { to, subject, mailContent } = req.body;
  try {
    await sendMail(to, subject, mailContent);
    res.json({ success: true, message: 'Email sent successfully!' });
  } catch (err) {
    console.error('Email error:', err);
    res.status(500).json({ success: false, error: 'Failed to send email' });
  }
};

// Send booking receipt
exports.sendReceipt = async (req, res) => {
  const { to, bookingID } = req.body;
  const paymentSummary = await getPaymentSummary(bookingID);
  if (!paymentSummary) return res.status(404).json({ error: "No payment found" });

  const {
    fullName, beneficiaryName, blockName, levelNumber, nicheColumn, nicheRow,
    bookingType, amount, paymentDate
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
};

// Denial notification
exports.sendDeniedRequest = async (req, res) => {
  const { to, fullName, reason } = req.body;
  const subject = 'Your Urn Placement Request Was Rejected';
  const html = `
    <p>Dear ${fullName},</p>
    <p>Your request was rejected for the following reason:</p>
    <p><strong>${reason}</strong></p>
    <p>Please update and resubmit your request if applicable.</p>
    <p>If you have any questions or require further assistance, feel free to contact our support team.</p>
    <p>Warm regards,<br/><strong>AfterLife Support Team</strong><br/>aftlifesup@gmail.com</p>
  `;

  try {
    await sendMail(to, subject, html);
    res.json({ success: true, message: 'Email sent successfully!' });
  } catch (err) {
    console.error('Email error:', err);
    res.status(500).json({ success: false, error: 'Failed to send email' });
  }
};

// Public: Send password reset link
exports.sendResetPassword = async (req, res) => {
  const { to: email } = req.body;

  try {
    const [users] = await db.execute("SELECT userID FROM User WHERE email = ?", [email]);
    if (users.length === 0) {
      return res.status(200).json({ message: "If the email is registered, a reset link has been sent." });
    }

    const userID = users[0].userID;
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await db.execute(
      "INSERT INTO PasswordResetToken (userID, token, expiresAt) VALUES (?, ?, ?)",
      [userID, token, expiresAt]
    );

    const resetLink = `http://localhost/reset-password?token=${token}`;
    const subject = 'Password Reset';
    const html = `
      <p>Dear user,</p>
      <p>Sorry to hear you’re having trouble logging into AfterLife. We got a message that you forgot your password.</p>
      <p>If this was you, you can reset your password using this link:</p>
      <p><a href="${resetLink}">${resetLink}</a></p>
      <p>This link will expire in 1 hour. If you didn’t request a password reset, you can ignore this message.</p>
    `;

    await sendMail(email, subject, html);
    res.json({ success: true, message: 'If the email is registered, a reset link has been sent.' });

  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ success: false, error: "Failed to send reset link" });
  }
};

// Internal: send account creation email (called from booking)
exports.sendAccountCreationEmail = async (conn, to, fullName) => {
  try {
    const [[row]] = await conn.execute("SELECT userID FROM User WHERE email = ?", [to]);
    const user = row;
    if (!user) return { ok: true, message: "If the email is registered, a reset link has been sent." };

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 1 week

    await conn.execute(
      "INSERT INTO PasswordResetToken (userID, token, expiresAt) VALUES (?, ?, ?)",
      [user.userID, token, expiresAt]
    );

    const resetLink = `http://localhost/reset-password?token=${token}`;
    const subject = "Set Up Password";
    const html = `
      <p>Hello ${fullName},</p>
      <p>An account has been created for you on AfterLife.</p>
      <p><strong>Please set up your password using this link as soon as possible:</strong></p>
      <p><a href="${resetLink}">${resetLink}</a></p>
      <p>If you have any questions or require further assistance, feel free to contact our support team.</p>
      <p>Warm regards,<br/><strong>AfterLife Support Team</strong><br/>aftlifesup@gmail.com</p>
    `;

    await sendMail(to, subject, html);
    console.log("Set‑up password e‑mail sent to", to);

    return { ok: true };
  } catch (err) {
    console.error("sendAccountCreationEmail failed:", err);
    throw err;
  }
};
