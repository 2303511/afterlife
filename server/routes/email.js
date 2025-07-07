const express = require('express');
const router = express.Router();
const { ensureAuth, ensureRole } = require('../middleware/auth');

const {
  sendGenericMail,
  sendReceipt,
  sendDeniedRequest,
  sendResetPassword
} = require('../controllers/emailController');

// Generic email
router.post('/sendMail', ensureAuth, ensureRole(['staff','admin']), sendGenericMail);

// Send receipt
router.post('/sendReceipt', ensureAuth, sendReceipt);

// Send denial notification
router.post('/sendDeniedRequest', ensureAuth, ensureRole(['staff','admin']), sendDeniedRequest);

// Public reset password
router.post('/sendResetPassword', sendResetPassword);

module.exports = router;
