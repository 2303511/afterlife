const express = require("express");
const router = express.Router();
const db = require("../db");

// GET all payments
router.get("/", async (req, res) => {
	try {
		const [payments] = await db.query("SELECT * FROM Payment");
		res.json(payments);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "Failed to fetch payments" });
	}
});

// GET payment by ID
router.get("/getPaymentByID", async (req, res) => {
	const paymentID = req.query.paymentID;

	if (!paymentID) {
		return res.status(400).json({ error: "Payment ID is required" });
	}

	try {
		const [payment] = await db.query("SELECT * FROM Payment WHERE paymentID = ?", [paymentID]);

		if (payment.length === 0) {
			return res.status(404).json({ error: "Payment not found" });
		}

		res.json(payment[0]);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "Failed to fetch payment" });
	}
});

// get Payment By User ID
router.get("/getPaymentByUserID", async (req, res) => {
	const userID = req.query.userID;

	if (!userID) {
		return res.status(400).json({ error: "User ID is required" });
	}

	try {
		const [payment] = await db.query("SELECT * FROM Payment WHERE userID = ?", [userID]);

		if (payment.length === 0) {
			return res.status(404).json({ error: `Payment by User ID ${userID} not found` });
		}

		res.json(payment[0]);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: `Failed to fetch payment by User ID ${userID}` });
	}
});

// get payment summary
async function getPaymentSummary(bookingID) {
    if (!bookingID) {
		throw new Error("Booking ID is required");
	}

    const [paymentSummary] = await db.query(`
        SELECT 
            u.fullName,
            bnf.beneficiaryName,

            bl.blockName,
            lv.levelNumber,
            nc.nicheColumn,
            nc.nicheRow,

            bk.bookingType,

            p.amount,
            p.paymentDate, 
            p.paymentMethod

        FROM Booking bk
        JOIN User u ON bk.paidByID = u.userID
        JOIN Beneficiary bnf ON bk.beneficiaryID = bnf.beneficiaryID
        JOIN Niche nc ON bk.nicheID = nc.nicheID
        JOIN Block bl ON nc.blockID = bl.blockID
        JOIN Level lv ON bl.levelID = lv.levelID
        JOIN Payment p ON bk.paymentID = p.paymentID
        WHERE bk.bookingID = ?;
    `, [bookingID]);

    if (paymentSummary.length === 0) {
        return null; // not found
    }

    return paymentSummary[0]; // return first result
}

module.exports = { router, getPaymentSummary };
