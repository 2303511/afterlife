const express = require("express");
const router = express.Router();
const {
  getAllPayments,
  getPaymentByID,
  getPaymentByUserID
} = require("../controllers/paymentController");

const { ensureAuth, ensureRole, ensureSelfOrRole} = require("../middleware/auth");

// GET all payments (staff/admin only)
router.get("/", ensureAuth, ensureRole(["staff", "admin"]), getAllPayments);

// GET payment by ID (self or staff/admin)
router.get("/getPaymentByID", ensureAuth, getPaymentByID);

// GET payment by User ID (self or staff/admin)
router.get("/getPaymentByUserID", ensureAuth, ensureSelfOrRole(["staff", "admin"]), getPaymentByUserID);

module.exports = router;
