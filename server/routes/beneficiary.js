const express = require('express');
const router = express.Router();
const db = require('../db');

router.get("/", async (req, res) => {
    console.log("Fetching all beneficiary");

    try {
        const [beneficiaries] = await db.query("SELECT * from Beneficiary");
        res.json(beneficiaries);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch all beneficiary" });
    }
});

// getBeneficiary
router.get("/getBeneficiaryByID", async (req, res) => {
    const beneficiaryID = req.params.beneficiaryID;
    console.log("Fetching specific beneficiary by ID:", beneficiaryID);

    try {
        const [beneficiary] = await db.query("SELECT * from Beneficiary WHERE beneficiaryID = ?", beneficiaryID);
        res.json(beneficiary);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch beneficiary by ID:", beneficiaryID });
    }
})

module.exports = router;