const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const upload = multer();
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
          p.paymentID,
          p.amount as paymentAmount,
          p.paymentMethod,
          p.paymentDate,
          p.paymentStatus,
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

// staff - view all pending bookings
router.get("/pending", async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                b.bookingID, b.bookingType, b.nicheID, b.beneficiaryID,
                u.fullName AS customerName, u.contactNumber,
                n.nicheCode, n.status AS nicheStatus, n.lastUpdated,
                be.beneficiaryName,
                p.amount AS paymentAmount, p.paymentMethod
            FROM Booking b
            JOIN User u ON b.paidByID = u.userID
            LEFT JOIN Beneficiary be ON b.beneficiaryID = be.beneficiaryID
            LEFT JOIN Niche n ON b.nicheID = n.nicheID
            LEFT JOIN Payment p ON b.paymentID = p.paymentID
            WHERE n.status = 'Pending'
            ORDER BY n.lastUpdated DESC
        `);

        res.json(rows);
    } catch (err) {
        console.error("Error fetching pending bookings:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// for user to submit their bookings
router.post("/submitBooking", async (req, res) => {
    const dbConn = await db.getConnection();
    await dbConn.beginTransaction();

    try {
        const {
            // Applicant
            fullName, gender, nationality, nationalID, mobileNumber, address, postalCode, unitNumber, dob,

            // Beneficiary
            beneficiaryName, beneficiaryGender, beneficiaryNationality, beneficiaryNationalID, beneficiaryAddress,
            dateOfBirth, dateOfDeath, birthCertificate, deathCertficate,
            relationshipWithApplicant, inscription,

            // Booking
            nicheID, bookingType,

            // Meta
            paidByID
        } = req.body;

        const validationErrors = validateBookingPayload(req.body, isPayment = true);

        if (Object.keys(validationErrors).length > 0) {
            return res.status(400).json({
                success: false,
                errors: validationErrors
            });
        }

        const userID = paidByID;
        const beneficiaryID = uuidv4();
        const bookingID = uuidv4();

        // 1. Get roleID
        const [[roleRow]] = await dbConn.query(
            "SELECT roleID FROM Role WHERE roleName = ?",
            ["Applicant"]
        );
        if (!roleRow) throw new Error("Role not found");
        const roleID = roleRow.roleID;

        const fullUserAddress = `${address}, ${unitNumber}, ${postalCode}`;

        // 2b. check if user exists.
        const exists = await dbConn.query("SELECT userID FROM User WHERE userID = ?", [userID]);
        if (exists.length == 0) {
            // current user do not exist, create a new user
            await dbConn.query(`
                INSERT INTO User (userID, fullName, gender, nationality, nric, contactNumber, userAddress, dob, roleID)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [userID, fullName, gender, nationality, nationalID, mobileNumber, fullUserAddress, dob, roleID]
            );
        } // else, ignore and continue on

        // based off booking type whether to insert death date
        const finalDateOfDeath = (bookingType === "PreOrder" || !dateOfDeath) ? null : dateOfDeath;

        // 3. Insert Beneficiary
        await dbConn.query(`
            INSERT INTO Beneficiary (
                beneficiaryID, beneficiaryName, gender, nationality, nric, beneficiaryAddress, dateOfBirth, dateOfDeath,
                birthCertificate, deathCertificate, relationshipWithApplicant, inscription
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [beneficiaryID, beneficiaryName, beneficiaryGender, beneficiaryNationality, beneficiaryNationalID, beneficiaryAddress,
                dateOfBirth, finalDateOfDeath, birthCertificate, deathCertficate, relationshipWithApplicant, inscription]
        );

        // 5. Insert Booking
        await dbConn.query(`
            INSERT INTO Booking (bookingID, nicheID, beneficiaryID, bookingType, paidByID, bookingStatus)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [bookingID, nicheID, beneficiaryID, bookingType, userID, "Pending"]
        );

        // 6. Determine Niche Status
        const nicheStatus = (bookingType === "Current") ? "Occupied" : "Reserved";
        // only have occupied and reserved because staff

        // 7. Update Niche Status
        await dbConn.query(`
            UPDATE Niche
            SET status = ?, lastUpdated = NOW()
            WHERE nicheID = ?
        `, [nicheStatus, nicheID]);

        await dbConn.commit();
        console.log("User Booking Created");
        res.status(201).json({ success: true, bookingID });

    } catch (err) {
        await dbConn.rollback();
        console.error("submission of booking failed:", err);
        res.status(500).json({ error: "Failed to submit booking" });
    } finally {
        dbConn.release();
    }
});

router.post("/updateBookingTransaction", async (req, res) => {
    const dbConn = await db.getConnection();
    await dbConn.beginTransaction();

    try {
        const { paymentMethod, paymentAmount, bookingID } = req.body

        const paymentID = uuidv4();
        const paymentDate = new Date().toISOString().split("T")[0];

        // insert payment records
        await dbConn.query(`
            INSERT INTO Payment (paymentID, amount, paymentMethod, paymentDate, paymentStatus)
            VALUES (?, ?, ?, ?, ?)`,
            [paymentID, paymentAmount, paymentMethod, paymentDate, "Fully Paid"]
        );

        // update booking to be updated
        // TODO: get booking ID
        await dbConn.query(`
            UPDATE Booking
            SET bookingStatus = ?, paymentID = ?
            WHERE bookingID = ?;`, ["Confirmed", paymentID, bookingID]);

        await dbConn.commit();
        res.status(201).json({ success: true, bookingID, paymentID });

    } catch (err) {
        await dbConn.rollback();
        console.error("submission of payment transaction:", err);
        res.status(500).json({ error: "Failed to submit booking" });
    } finally {
        dbConn.release();
    }
})




// insert user -> beneficiary -> payment -> booking -> update niche status
// assuming that the applicant is someone who doesnt have a account with us, then the staff creates a new user for them.
router.post("/submitStaffBooking", upload.fields([
    { name: 'birthCertFile', maxCount: 1 },
    { name: 'deathCertFile', maxCount: 1 }
]), async (req, res) => {
    const dbConn = await db.getConnection();
    await dbConn.beginTransaction();

    try {
        const {
            // Applicant
            fullName, gender, nationality, nationalID, mobileNumber, address, postalCode, unitNumber, dob,

            // Beneficiary
            beneficiaryName, beneficiaryGender, beneficiaryNationality, beneficiaryNationalID, beneficiaryAddress,
            dateOfBirth, dateOfDeath, relationshipWithApplicant, inscription,

            // Booking
            nicheID, bookingType,

            // Payment
            paymentMethod, paymentAmount,

            // Meta
            paidByID
        } = req.body;

        const birthCertificate = req.files['birthCertFile'] ? req.files['birthCertFile'][0].buffer : null;
        const deathCertificate = req.files['deathCertFile'] ? req.files['deathCertFile'][0].buffer : null;

        const payload = {
            ...req.body,
            birthCertificate,
            deathCertificate
        };

        const validationErrors = validateBookingPayload(payload, isPayment = false);

        if (Object.keys(validationErrors).length > 0) {
            return res.status(400).json({
                success: false,
                errors: validationErrors
            });
        }

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

        const fullUserAddress = `${address}, ${unitNumber}, ${postalCode}`;

        // 2. Insert User
        await dbConn.query(`
            INSERT INTO User (userID, fullName, gender, nationality, nric, contactNumber, userAddress, dob, roleID)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [userID, fullName, gender, nationality, nationalID, mobileNumber, fullUserAddress, dob, roleID]
        );

        // based off booking type whether to insert death date
        const finalDateOfDeath = (bookingType === "PreOrder" || !dateOfDeath) ? null : dateOfDeath;

        // 3. Insert Beneficiary
        await dbConn.query(`
            INSERT INTO Beneficiary (
                beneficiaryID, beneficiaryName, gender, nationality, nric, beneficiaryAddress, dateOfBirth, dateOfDeath,
                birthCertificate, deathCertificate, relationshipWithApplicant, inscription
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [beneficiaryID, beneficiaryName, beneficiaryGender, beneficiaryNationality, beneficiaryNationalID, beneficiaryAddress,
                dateOfBirth, finalDateOfDeath, birthCertificate, deathCertificate, relationshipWithApplicant, inscription]
        );

        // 4. Insert Payment
        await dbConn.query(`
            INSERT INTO Payment (paymentID, amount, paymentMethod, paymentDate, paymentStatus)
            VALUES (?, ?, ?, ?, ?)`,
            [paymentID, paymentAmount, paymentMethod, paymentDate, "Fully Paid"]
        );

        // 5. Insert Booking — FIXED ORDER!
        await dbConn.query(`
            INSERT INTO Booking (bookingID, nicheID, paidByID, paymentID, beneficiaryID, bookingType, bookingStatus)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [bookingID, nicheID, userID, paymentID, beneficiaryID, bookingType, "Confirmed"]
        );
        

        // 6. Determine Niche Status
        const nicheStatus = (bookingType === "Current") ? "Occupied" : "Reserved";

        // 7. Update Niche Status
        await dbConn.query(`
            UPDATE Niche
            SET status = ?, lastUpdated = NOW()
            WHERE nicheID = ?
        `, [nicheStatus, nicheID]);

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

//bene.beneficiaryNRIC, 
router.get("/approval/:bookingID", async (req, res) => {
    const dbConn = await db.getConnection();

    try {
        const [rows] = await dbConn.query(
            `
            SELECT 
                b.*, 
                bene.beneficiaryID, 
                bene.beneficiaryName, 
                bene.dateOfBirth, 
                bene.dateOfDeath, 
                bene.birthCertificate, 
                bene.deathCertificate, 
                bene.relationshipWithApplicant, 
                bene.inscription, 
                n.nicheID, 
                n.blockID, 
                n.nicheCode, 
                n.status AS nicheStatus, 
                n.lastUpdated,
                p.paymentID,
                p.amount AS paymentAmount,
                p.paymentMethod,
                p.paymentDate,
                p.paymentStatus,
                u.fullName AS customerName,
                u.contactNumber
            FROM Booking b
            LEFT JOIN Beneficiary bene ON b.beneficiaryID = bene.beneficiaryID
            LEFT JOIN Niche n ON b.nicheID = n.nicheID
            LEFT JOIN Payment p ON b.paymentID = p.paymentID
            JOIN User u ON b.paidByID = u.userID
            WHERE b.bookingID = ?
            `,
            [req.params.bookingID]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: "Booking not found" });
        }

        const booking = rows[0];

        // Convert certs to base64
        const birthCertBase64 = booking.birthCertificate ? booking.birthCertificate.toString('base64') : '';
        const deathCertBase64 = booking.deathCertificate ? booking.deathCertificate.toString('base64') : '';

        res.json({
            ...booking,
            birthCertBase64,
            deathCertBase64
        });
    } catch (err) {
        console.error("Error fetching booking:", err);
        res.status(500).json({ message: "Internal server error" });
    } finally {
        dbConn.release();
    }
});








module.exports = router;

function validateBookingPayload(payload, isPayment) {
    console.log("Payload received:", payload);

    const errors = {};

    // Applicant
    if (!payload.fullName) errors.fullName = "Full Name is required";
    if (!payload.gender) errors.gender = "Gender is required";
    if (!payload.nationality) errors.nationality = "Nationality is required";

    if (!/^[STFG]\d{7}[A-Z]$/.test(payload.nationalID)) {
        errors.nationalID = "Invalid NRIC format (S1234567A)";
    }

    if (!/^[89]\d{7}$/.test(payload.mobileNumber)) {
        errors.mobileNumber = "Invalid mobile number (8 digits starting with 8 or 9)";
    }

    if (!payload.address) errors.address = "Address is required";
    if (!/^\d{6}$/.test(payload.postalCode)) {
        errors.postalCode = "Invalid postal code (6 digits)";
    }

    if (!payload.unitNumber) errors.unitNumber = "Unit Number is required";
    if (!payload.dob) errors.dob = "Date of Birth is required";

    // Beneficiary
    if (!payload.beneficiaryName) errors.beneficiaryName = "Beneficiary Name is required";
    if (!payload.beneficiaryGender) errors.beneficiaryGender = "Beneficiary Gender is required";
    if (!payload.relationshipWithApplicant) errors.relationshipWithApplicant = "Relationship is required";
    if (!payload.beneficiaryNationality) errors.beneficiaryNationality = "Beneficiary Nationality is required";

    if (!/^[STFG]\d{7}[A-Z]$/.test(payload.beneficiaryNationalID)) {
        errors.beneficiaryNationalID = "Invalid Beneficiary NRIC format (S1234567A)";
    }

    if (!payload.dateOfBirth) errors.dateOfBirth = "Beneficiary Date of Birth is required";

    // Only validate Date of Death if Current booking
    if (payload.bookingType === "Current") {
        if (!payload.dateOfDeath) errors.dateOfDeath = "Beneficiary Date of Death is required";

        if (payload.dateOfBirth && payload.dateOfDeath) {
            const dob = new Date(payload.dateOfBirth);
            const dod = new Date(payload.dateOfDeath);

            if (dod < dob) {
                errors.dateOfDeath = "Date of Death cannot be before Date of Birth";
            }
        }
    }

    if (!payload.beneficiaryAddress) errors.beneficiaryAddress = "Address is required";
    if (!/^\d{6}$/.test(payload.beneficiaryPostalCode)) {
        errors.beneficiaryPostalCode = "Invalid postal code (6 digits)";
    }

    if (!payload.beneficiaryUnitNumber) errors.beneficiaryUnitNumber = "Unit Number is required";

    if (!payload.inscription) {
        errors.inscription = "Inscription is required";
    }

    if (!payload.deathCertificate) {
        errors.deathCertficate = "Death Certificate file is required";
    }

    // Always validate birth cert (temp removal)
    if (!payload.deathCertificate) errors.birthCertficate = "Birth Certificate file is required";

    // Booking
    if (!payload.nicheID) errors.nicheID = "Niche ID is required";
    if (!payload.bookingType) errors.bookingType = "Booking Type is required";

    // Payment
    if (!isPayment) {
        if (!payload.paymentMethod) errors.paymentMethod = "Payment Method is required";

        if (!payload.paymentAmount || isNaN(payload.paymentAmount)) {
            errors.paymentAmount = "Valid Payment Amount is required";
        }
    }

    //if (!payload.paidByID) errors.paidByID = "Paid By ID is required";

    return errors;
}

