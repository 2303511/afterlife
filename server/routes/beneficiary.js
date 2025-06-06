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

module.exports = router;