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

// staff - to search for bookings under a user's phone number
router.get('/search', async (req, res) => {
    const query = req.query.query;

    try {
        const [rows] = await db.query(`
        SELECT 
          b.*, 
          u.fullName AS customerName,
          u.contactNumber,
          be.beneficiaryName,
          p.amount,
          p.paymentMethod,
          n.nicheCode,
          n.status AS nicheStatus
        FROM Booking b
        JOIN User u ON b.paidByID = u.userID
        LEFT JOIN Beneficiary be ON b.beneficiaryID = be.beneficiaryID
        LEFT JOIN Payment p ON b.paymentID = p.paymentID
        LEFT JOIN Niche n ON b.nicheID = n.nicheID
        WHERE u.contactNumber LIKE ?
      `, [`%${query}%`]);

        res.json(rows);
    } catch (err) {
        console.error("Search error:", err);
        res.status(500).send("Internal server error");
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

        // 1. Get roleID
        const [[roleRow]] = await dbConn.query(
            "SELECT roleID FROM Role WHERE roleName = ?",
            ["Applicant"]
        );
        if (!roleRow) throw new Error("Role not found");
        const roleID = roleRow.roleID;

        // 2. Insert User
        await dbConn.query(`
            INSERT INTO User (userID, fullName, gender, nationality, nric, contactNumber, userAddress, dob, roleID)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [userID, fullName, gender, nationality, nationalID, mobileNumber, address, dob, roleID]
        );

        // 3. Insert Beneficiary
        await dbConn.query(`
            INSERT INTO Beneficiary (
                beneficiaryID, beneficiaryName, dateOfBirth, dateOfDeath,
                birthCertificate, deathCertificate, relationshipWithApplicant, inscription
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [beneficiaryID, beneficiaryName, dateOfBirth, dateOfDeath, birthCertificate, deathCertficate,
                relationshipWithApplicant, inscription]
        );

        // 4. Insert Payment
        await dbConn.query(`
        INSERT INTO Payment (paymentID, amount, paymentMethod, paymentDate, paymentStatus)
        VALUES (?, ?, ?, ?, ?)`,
            [paymentID, paymentAmount, paymentMethod, paymentDate, "Fully Paid"]
        );

        // 5. Insert Booking
        await dbConn.query(`
        INSERT INTO Booking (bookingID, nicheID, beneficiaryID, bookingType, paymentID, paidByID)
        VALUES (?, ?, ?, ?, ?, ?)`,
            [bookingID, nicheID, beneficiaryID, bookingType, paymentID, userID]
        );

        // 6. Update Niche Status
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

// staff - to approve pending niches aka to put a urn in
router.post('/approve', async (req, res) => {
    const { bookingID, nicheID } = req.body;

    const dbConn = await db.getConnection();
    await dbConn.beginTransaction();

    try {
        // 1. Update booking type
        await dbConn.query(
            `UPDATE Booking SET bookingType = ? WHERE bookingID = ?`,
            ['Current', bookingID]
        );

        // 2. Update niche status
        await dbConn.query(
            `UPDATE Niche SET status = ?, lastUpdated = NOW() WHERE nicheID = ?`,
            ['Occupied', nicheID]
        );

        await dbConn.commit();
        res.status(200).json({ success: true });
    } catch (err) {
        await dbConn.rollback();
        console.error("Approve failed:", err);
        res.status(500).json({ error: "Failed to approve booking" });
    } finally {
        dbConn.release();
    }
});

// staff - to archive ('free') niches once the applicants are done with it
router.post('/booking/archive', async (req, res) => {
    const { bookingID, nicheID } = req.body;

    const dbConn = await db.getConnection();
    await dbConn.beginTransaction();

    try {
        // 1. Archive the booking
        await dbConn.query(
            `UPDATE Booking SET bookingType = ? WHERE bookingID = ?`,
            ['Archived', bookingID]
        );

        // 2. Free up the niche
        await dbConn.query(
            `UPDATE Niche SET status = ?, lastUpdated = NOW() WHERE nicheID = ?`,
            ['Available', nicheID]
        );

        await dbConn.commit();
        res.status(200).json({ success: true });
    } catch (err) {
        await dbConn.rollback();
        console.error("Archiving failed:", err);
        res.status(500).json({ error: "Failed to archive booking" });
    } finally {
        dbConn.release();
    }
});




module.exports = router;