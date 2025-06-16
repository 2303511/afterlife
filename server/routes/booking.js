const express = require('express');
const router = express.Router();
const db = require('../db');
const { v4: uuidv4 } = require("uuid");

router.get("/", async (req, res) => {
    console.log("Fetching bookings for user:", req.query.userID);
    const userID = req.query.userID;

    if (!userID) {
        return res.status(400).json({ error: "User ID is required" });
    }

    try {
        const [bookings] = await db.query('SELECT * FROM Booking WHERE userID = ?', [userID]);
        res.json(bookings);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch bookings" });
    }
});

router.get("/getBookingByUserID", async (req, res) => {
    console.log("Fetching bookings for user with ID:", req.query.userID);
    const userID = req.query.userID;

    try {
        const [bookings] = await db.query('SELECT * FROM Booking WHERE paidByID = ?', [userID]);

        if (bookings.length === 0) {
            return res.json([]); // Return empty array if no bookings found
        }

        console.log("Bookings found:", bookings);
        res.json(bookings);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch bookings" });
    }

});

router.get("/getBookingByBookingID", async (req, res) => {
    console.log("Fetching bookings for booking with ID:", req.query.bookingID);
    const bookingID = req.query.bookingID;

    try {
        const [bookings] = await db.query('SELECT * FROM Booking WHERE bookingID = ?', [bookingID]);

        if (bookings.length === 0) {
            return res.json([]); // Return empty array if no bookings found
        }

        console.log("Bookings found:", bookings);
        res.json(bookings);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch bookings" });
    }

});

// insert user -> beneficiary -> payment -> booking -> update niche status
router.post("/submitStaffBooking", async (req, res) => {
    const dbConn = await db.getConnection();
    await dbConn.beginTransaction();

    try {
        const {
            // Applicant
            fullName, gender, nationality, nationalID, mobileNumber, address, postalCode, unitNumber, dob,

            // Beneficiary --> beneficiaryNationality, beneficiaryNationalID (not in table, but inside form)
            beneficiaryName, beneficiaryGender, beneficiaryNationality, beneficiaryNationalID, dateOfBirth, dateOfDeath,
            birthCertificate, deathCertficate, relationshipWithApplicant, inscription, beneficiaryRemarks,

            // Booking
            nicheID, bookingType,
            // Payment
            paymentMethod, paymentAmount,
            // Meta
            paidByID
        } = req.body;

        const userID = uuidv4();
        const beneficiaryID = uuidv4();
        const bookingID = uuidv4();
        const paymentID = uuidv4();
        const paymentDate = new Date().toISOString().split("T")[0];

        // Get roleID
        const [[roleRow]] = await dbConn.query(
            "SELECT roleID FROM Role WHERE roleName = ?",
            ["Applicant"]
        );
        if (!roleRow) throw new Error("Role not found");
        const roleID = roleRow.roleID;

        // Insert User
        await dbConn.query(`
            INSERT INTO User (userID, fullName, gender, nationality, nric, contactNumber, userAddress, dob, roleID)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [userID, fullName, gender, nationality, nationalID, mobileNumber, address, dob, roleID]
        );

        // Insert Beneficiary
        await dbConn.query(`
            INSERT INTO Beneficiary (
                beneficiaryID, beneficiaryName, dateOfBirth, dateOfDeath,
                birthCertificate, deathCertificate, relationshipWithApplicant, inscription
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [beneficiaryID, beneficiaryName, dateOfBirth, dateOfDeath, birthCertificate, deathCertficate,
                relationshipWithApplicant, inscription]
        );

        // Insert Payment
        await dbConn.query(`
        INSERT INTO Payment (paymentID, amount, paymentMethod, paymentDate, paymentStatus)
        VALUES (?, ?, ?, ?, ?)`,
            [paymentID, paymentAmount, paymentMethod, paymentDate, "Fully Paid"]
        );

        // Insert Booking
        await dbConn.query(`
        INSERT INTO Booking (bookingID, nicheID, beneficiaryID, bookingType, paymentID, paidByID)
        VALUES (?, ?, ?, ?, ?, ?)`,
            [bookingID, nicheID, beneficiaryID, bookingType, paymentID, userID]
        );

        // Update Niche Status
        await dbConn.query(`
            UPDATE Niche
            SET status = ?, lastUpdated = NOW()
            WHERE nicheID = ?
            `, ['Reserved', nicheID]);

        await dbConn.commit();
        res.status(201).json({ success: true, bookingID, paymentID });

    } catch (err) {
        await dbConn.rollback();
        console.error("submission of booking failed:", err);
        res.status(500).json({ error: "Failed to submit booking" });
    } finally {
        dbConn.release();
    }
});


module.exports = router;