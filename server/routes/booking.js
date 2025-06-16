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

// booking made by staff member
router.post("/submitStaffBooking", async (req, res) => {
    let dbConn;
    dbConn = await db.getConnection();
    await dbConn.beginTransaction();
 
    try {
        const {
            // Applicant
            fullName, gender, nationality, nationalID, mobileNumber, address, postalCode, unitNumber, dob,

            // Beneficiary --> beneficiaryNationality, beneficiaryNationalID (not in table, but inside form)
            beneficiaryName, beneficiaryGender, beneficiaryNationality, beneficiaryNationalID, dateOfBirth, dateOfDeath, 
            birthCertificate, deathCertficate, relationshipWithApplicant, inscription, beneficiaryRemarks,

            // Booking
            nicheID, bookingType
        } = req.body;

        const [existing] = await db.query("SELECT * FROM Booking WHERE nicheID = ?", [req.body.nicheID]);
            if (existing.length > 0) {
                return res.status(409).json({ error: "Niche already booked" });
        }

        const [userID, beneficiaryID, bookingID] = [uuidv4(), uuidv4(), uuidv4()];
        
        const [[roleRow]] = await db.query(
            "SELECT roleID FROM Role WHERE roleName = ?",
            ["Applicant"]
          );
          
          if (!roleRow) {
            return res.status(400).json({ error: "Role not found" });
          }
          
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

        // Insert Booking
        await dbConn.query(`
            INSERT INTO Booking (bookingID, nicheID, beneficiaryID, bookingType)
            VALUES (?, ?, ?, ?)`,
            [bookingID, nicheID, beneficiaryID, bookingType]
        );

        await dbConn.commit();
        dbConn.release();

        res.status(201).json({ success: true, bookingID });

    } catch (err) {
        await dbConn.rollback();
        dbConn.release();
        console.error("Booking error:", err);
        res.status(500).json({ error: "Booking failed" });
    } finally {
        if (dbConn) dbConn.release();
    }
    
})

module.exports = router;