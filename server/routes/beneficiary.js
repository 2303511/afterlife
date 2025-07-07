const express = require("express");
const router = express.Router();
const { ensureAuth, ensureRole } = require("../middleware/auth.js");

const {
  getAllBeneficiaries,
  getBeneficiaryByID
} = require("../controllers/beneficiaryController");

// List all (staff/admin only)
router.get("/", ensureAuth, ensureRole(["staff", "admin"]), getAllBeneficiaries);

// Get one beneficiary (owner or staff/admin)
router.get("/getBeneficiaryByID", ensureAuth, getBeneficiaryByID);

module.exports = router;
