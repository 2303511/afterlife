const express       = require('express');
const router        = express.Router();
const db            = require('../db');
const { ensureAuth, ensureRole } = require('../middleware/auth.js');

// List all (staff/admin only)
router.get(
  "/",
  ensureAuth,
  ensureRole(["staff","admin"]),
  async (req, res) => {
    try {
      const [rows] = await db.query("SELECT * FROM Beneficiary");
      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch beneficiaries" });
    }
  }
);

// Get one beneficiary (owner or staff/admin)
router.get(
  "/getBeneficiaryByID",
  ensureAuth,
  async (req, res) => {
    const beneficiaryID = req.query.beneficiaryID;
    const userID        = req.session.userID;
    const role          = req.session.role;

    try {
      // 1) Load the beneficiary and the booking that references it
      const [[ beneficiary ]] = await db.query(`
        SELECT b.*, bk.paidByID
        FROM Beneficiary AS b
        JOIN Booking    AS bk ON bk.beneficiaryID = b.beneficiaryID
        WHERE b.beneficiaryID = ?
      `, [beneficiaryID]);

      if (!beneficiary) {
        return res.status(404).json({ error: "Beneficiary not found" });
      }

      // 2) Check authorization: either staff/admin or the booking owner
      if (role !== "staff" && role !== "admin" && beneficiary.paidByID !== userID) {
        return res.status(403).json({ error: "Forbidden" });
      }

      // 3) Return the beneficiary record
      res.json(beneficiary);
    } catch (err) {
      console.error("Error fetching beneficiary:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

module.exports = router;
