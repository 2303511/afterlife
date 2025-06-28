const express = require('express');
const router = express.Router();
const db = require('../db');

const multer = require('multer');
const upload = multer();

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
    const beneficiaryID = req.query.beneficiaryID;
    console.log("Fetching specific beneficiary by ID:", beneficiaryID);

    try {
        const [beneficiary] = await db.query("SELECT * from Beneficiary WHERE beneficiaryID = ?", [beneficiaryID]);
        console.log("beneficiary fetched:", beneficiary);

        if (beneficiary.length === 0) {
            return res.status(404).json({ error: 'Beneficiary not found' });
        }

        res.json(beneficiary[0]);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch beneficiary by ID:", beneficiaryID });
    }
});

router.post("/place-urn", upload.single("deathCertFile"), async (req, res) => {
    const { beneficiaryID, dateOfDeath, inscription } = req.body;
    const deathCertificate = req.file?.buffer || null;
    const deathCertificateMime = req.file?.mimetype || null;

    console.log("Received urn placement data:");
    console.log({ beneficiaryID, dateOfDeath, hasFile: !!req.file });

    try {
        const [result] = await db.query(
            `UPDATE Beneficiary 
             SET dateOfDeath = ?, deathCertificate = ?, deathCertificateMime = ?, inscription = ?
             WHERE beneficiaryID = ?`,
            [new Date(dateOfDeath), deathCertificate, deathCertificateMime, inscription, beneficiaryID]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Beneficiary not found." });
        }

        res.json({ message: "Urn placement details updated successfully." });

    } catch (err) {
        console.error("Error updating beneficiary:", err);
        res.status(500).json({ error: "Failed to update urn placement details." });
    }
});

module.exports = router;