const express = require('express');
const router = express.Router();
const db = require('../db');

const multer = require('multer');
const upload = multer();

router.get("/", async (req, res) => {
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
    const beneficiaryID = req.query.beneficiaryID;

    try {
        const [beneficiary] = await db.query("SELECT * from Beneficiary WHERE beneficiaryID = ?", [beneficiaryID]);

        if (beneficiary.length === 0) {
            return res.status(404).json({ error: 'Beneficiary not found' });
        }

        res.json(beneficiary[0]);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch beneficiary by ID:", beneficiaryID });
    }
});


module.exports = router;