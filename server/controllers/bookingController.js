const db = require("../db");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const { sendAccountCreationEmail } = require("../controllers/emailController");
const validateBookingPayload = require("../utils/validateBookingPayload");

function generateRandomPassword(length = 12) {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    return Array.from({ length }, () => charset[Math.floor(Math.random() * charset.length)]).join('');
}

exports.getBookingsForUser = async (req, res) => {
    const userID = req.query.userID;
    if (!userID) return res.status(400).json({ error: "User ID is required" });

    try {
        const [bookings] = await db.query("SELECT * FROM Booking WHERE userID = ?", [userID]);
        res.json(bookings);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch bookings" });
    }
};

// GET /api/booking/getBookingByUserID
exports.getBookingByUserID = async (req, res) => {
    const userID = req.query.userID;
    try {
        const [bookings] = await db.query("SELECT * FROM Booking WHERE paidByID = ?", [userID]);
        res.json(bookings.length ? bookings : []);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch bookings" });
    }
};

exports.getBookingByBookingID = async (req, res) => {
    // GET a booking by bookingID (self if owner, or staff/admin)
    const bookingID = req.query.bookingID;
    try {
        const [rows] = await db.query("SELECT * FROM Booking WHERE bookingID = ?", [bookingID]);
        if (!rows.length) return res.json([]);
        const booking = rows[0];
        if (booking.paidByID !== req.session.userID && !["staff", "admin"].includes(req.session.role)) {
            return res.status(403).json({ error: "Forbidden" });
        }
        res.json(booking);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch bookings" });
    }
}

exports.getSearchedBookings = async (req, res) => {
    const q = req.query.query;
    try {
        const [rows] = await db.query(
            `SELECT b.*, u.fullName AS customerName, u.contactNumber, be.beneficiaryName,
                p.paymentID, p.amount AS paymentAmount, p.paymentMethod, p.paymentDate, p.paymentStatus,
                n.nicheCode, n.status AS nicheStatus
         FROM Booking b
         JOIN User u ON b.paidByID = u.userID
         JOIN Role r ON u.roleID = r.roleID
         LEFT JOIN Beneficiary be ON b.beneficiaryID = be.beneficiaryID
         LEFT JOIN Payment p ON b.paymentID = p.paymentID
         LEFT JOIN Niche n ON b.nicheID = n.nicheID
         WHERE u.contactNumber LIKE ? AND r.roleName = 'Applicant'`,
            [`%${q}%`]
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal server error");
    }
};

exports.getPendingBookings = async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT b.bookingID, b.bookingType, b.bookingStatus, b.nicheID, b.beneficiaryID,
                u.fullName AS customerName, u.contactNumber,
                n.nicheCode, n.status AS nicheStatus, n.lastUpdated,
                be.beneficiaryName, p.amount AS paymentAmount, p.paymentMethod
         FROM Booking b
         JOIN User u ON b.paidByID = u.userID
         LEFT JOIN Beneficiary be ON b.beneficiaryID = be.beneficiaryID
         LEFT JOIN Niche n ON b.nicheID = n.nicheID
         LEFT JOIN Payment p ON b.paymentID = p.paymentID
         WHERE b.bookingStatus = 'Pending'
         ORDER BY n.lastUpdated DESC`
        );
        res.json(rows);
    } catch (err) {
        console.error("Failed to retrieve pending bookings:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};


exports.submitBooking = async (req, res) => {
    const dbConn = await db.getConnection();
    await dbConn.beginTransaction();
    try {
        const {
            fullName, gender, nationality, nationalID, mobileNumber, email, address, postalCode, unitNumber, dob,
            beneficiaryName, beneficiaryGender, beneficiaryNationality, beneficiaryNationalID, beneficiaryAddress,
            dateOfBirth, dateOfDeath, relationshipWithApplicant,
            nicheID, bookingType, paidByID, userRole
        } = req.body;

        const birthCertificate = req.files['birthCertFile']?.[0]?.buffer || null;
        const birthCertificateMime = req.files['birthCertFile']?.[0]?.mimetype || null;
        const deathCertificate = req.files['deathCertFile']?.[0]?.buffer || null;
        const deathCertificateMime = req.files['deathCertFile']?.[0]?.mimetype || null;

        const payload = {
            ...req.body, birthCertificate, birthCertificateMime, deathCertificate, deathCertificateMime
        };

        const validationErrors = validateBookingPayload(payload, true);
        if (Object.keys(validationErrors).length > 0) {
            return res.status(400).json({ success: false, errors: validationErrors });
        }

        const beneficiaryID = uuidv4();
        const bookingID = uuidv4();
        let finalUserID = paidByID;

        const [[roleRow]] = await dbConn.query("SELECT roleID FROM Role WHERE roleName = ?", ["Applicant"]);
        if (!roleRow) throw new Error("Role not found");
        const roleID = roleRow.roleID;

        const fullUserAddress = `${address}, ${unitNumber}, ${postalCode}`;

        if (userRole === "user") {
            const [[existingUser]] = await dbConn.query("SELECT userID FROM User WHERE userID = ?", [paidByID]);
            if (!existingUser) throw new Error("User does not exist. Invalid session.");
        }

        if (userRole === "staff") {
            const [[existingUser]] = await dbConn.query("SELECT * FROM User WHERE nric = ?", [nationalID]);

            if (existingUser) {
                finalUserID = existingUser.userID;
                const normalizedDob = new Date(dob).toISOString().split("T")[0];
                const dbDob = new Date(existingUser.dob).toISOString().split("T")[0];

                if (
                    existingUser.fullName !== fullName ||
                    existingUser.contactNumber !== mobileNumber ||
                    normalizedDob !== dbDob
                ) {
                    throw new Error("NRIC conflict with existing user details.");
                }
            } else {
                finalUserID = uuidv4();
                const randomPassword = generateRandomPassword();
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(randomPassword, salt);

                await dbConn.query(`
            INSERT INTO User (userID, fullName, gender, nationality, nric, contactNumber, userAddress, dob, roleID, email, hashedPassword, salt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [finalUserID, fullName, gender, nationality, nationalID, mobileNumber, fullUserAddress, dob, roleID, email, hashedPassword, salt]
                );

                await sendAccountCreationEmail(dbConn, email, fullName);
            }
        }

        const finalDateOfDeath = (bookingType === "PreOrder" || !dateOfDeath) ? null : dateOfDeath;

        await dbConn.query(`
        INSERT INTO Beneficiary (
          beneficiaryID, beneficiaryName, gender, nationality, nric, beneficiaryAddress, dateOfBirth, dateOfDeath,
          birthCertificate, birthCertificateMime, deathCertificate, deathCertificateMime,
          relationshipWithApplicant
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [beneficiaryID, beneficiaryName, beneficiaryGender, beneficiaryNationality, beneficiaryNationalID, beneficiaryAddress,
                dateOfBirth, finalDateOfDeath, birthCertificate, birthCertificateMime, deathCertificate, deathCertificateMime,
                relationshipWithApplicant]
        );

        const bookingStatus = userRole === "user" ? "Pending" : "Confirmed";
        const updatedNicheStatus = (userRole === "user") ? "Pending" : (bookingType === "Current") ? "Occupied" : "Reserved";

        await dbConn.query(`
        INSERT INTO Booking (bookingID, nicheID, beneficiaryID, bookingType, paidByID, bookingStatus)
        VALUES (?, ?, ?, ?, ?, ?)`,
            [bookingID, nicheID, beneficiaryID, bookingType, finalUserID, bookingStatus]
        );

        await dbConn.query(
            `UPDATE Niche SET status = ?, lastUpdated = NOW() WHERE nicheID = ?`,
            [updatedNicheStatus, nicheID]
        );

        await dbConn.commit();
        res.status(201).json({ success: true, bookingID });
    } catch (err) {
        await dbConn.rollback();
        console.error("Booking submission failed:", err);
        res.status(500).json({ error: "Failed to submit booking" });
    } finally {
        dbConn.release();
    }
};

exports.deleteDraftBookings = async (req, res) => {
    const {bookingID} = req.body; // retrieve the bookingID to delete

    const dbConn = await db.getConnection();
    await dbConn.beginTransaction();

    try {
        // 1. retrieve the booking details
        const [bookingRows] = await dbConn.query(`
            SELECT beneficiaryID, paidByID, nicheID
            FROM Booking
            WHERE bookingID = ?
            `, [bookingID]);

        if (!bookingRows.length) throw new Error(`Booking with bookingID: ${bookingID} not found`);
        // 1a. set the beneficiary ID and paidbyID
        const {beneficiaryID, paidByID, nicheID} = bookingRows[0];

        // 2. delete booking itself
        const [deleteBooking] = await dbConn.query(`
            DELETE FROM Booking
            WHERE bookingID = ?;
            `, [bookingID]);
        if (deleteBooking.affectedRows === 0) throw new Error(`Failed to delete booking with ID: ${bookingID}`);

        // 3. delete beneficiary data
        const [deleteBeneficiaryResponse] = await dbConn.query(`
            DELETE FROM Beneficiary
            WHERE beneficiaryID = ?;
            `, [beneficiaryID]);
        if (deleteBeneficiaryResponse.affectedRows === 0) throw new Error(`Failed to delete benficiary with beneficiaryID: ${beneficiaryID}`);

        // 4. delete user if there are no other bookings under them
        const [[{ bookingCount }]] = await dbConn.query(
            `SELECT COUNT(*) AS bookingCount FROM Booking WHERE paidByID = ?`, [paidByID]
            );
        // this is their only this newly created account
        if (bookingCount <= 1) {
            const [deleteUser] = await dbConn.query(`DELETE FROM User WHERE userID = ?`, [paidByID]);
            if (deleteUser.affectedRows === 0) throw new Error(`Failed to delete existing user with userID ${paidByID}`);
        }

        // 5. make the niche available
        const [updateNiche] = await dbConn.query(`
            UPDATE Niche
            SET status = 'Available', lastUpdated = NOW()
            WHERE nicheID = ?;
            `, [nicheID]);
        if (updateNiche.affectedRows === 0) throw new Error(`Failed to make niche with ID ${nicheID} available`);

        // 6. successfully deleted the booking
        await dbConn.commit();
        res.status(201).json({ success: true, bookingID });

    } catch (err) {
        await dbConn.rollback(); // undo all transactions
        console.error("Failed to delete draft booking:", err);
        res.status(500).json({ message: "Failed to delete draft booking" });
    } finally {
        dbConn.release();
    }
}

exports.updateBookingTransaction = async (req, res) => {
    const dbConn = await db.getConnection();
    await dbConn.beginTransaction();

    try {
        let { paymentMethod, paymentAmount, bookingID } = req.body;
        paymentAmount = paymentAmount || process.env.PAYMENT_AMOUNT;

        const paymentID = uuidv4();
        const paymentDate = new Date().toISOString().split("T")[0];

        await dbConn.query(
            `INSERT INTO Payment (paymentID, amount, paymentMethod, paymentDate, paymentStatus)
         VALUES (?, ?, ?, ?, ?)`,
            [paymentID, paymentAmount, paymentMethod, paymentDate, "Fully Paid"]
        );

        await dbConn.query(
            `UPDATE Booking SET paymentID = ? WHERE bookingID = ?`,
            [paymentID, bookingID]
        );

        await dbConn.commit();
        res.status(201).json({ success: true, bookingID, paymentID });

    } catch (err) {
        await dbConn.rollback();
        console.error("submission of payment transaction:", err);
        res.status(500).json({ error: "Failed to submit booking" });
    } finally {
        dbConn.release();
    }
};

exports.placeUrn = async (req, res) => {
    const { bookingID, nicheID, beneficiaryID, dateOfDeath } = req.body;
    const deathCertificate = req.file?.buffer || null;
    const deathCertificateMime = req.file?.mimetype || null;

    try {
        const [result] = await db.query(
            `UPDATE Beneficiary 
         SET dateOfDeath = ?, deathCertificate = ?, deathCertificateMime = ?
         WHERE beneficiaryID = ?`,
            [new Date(dateOfDeath), deathCertificate, deathCertificateMime, beneficiaryID]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Beneficiary not found." });
        }

        const [updateNiche, updateBooking] = await Promise.all([
            db.query(`UPDATE Niche SET status = ? WHERE nicheID = ?`, ["Pending", nicheID]),
            db.query(`UPDATE Booking SET bookingStatus = ?, bookingType = ? WHERE bookingID = ?`, ["Pending", "Current", bookingID])
        ]);

        if (updateNiche[0].affectedRows === 0) {
            return res.status(404).json({ error: "Niche not found." });
        }

        if (updateBooking[0].affectedRows === 0) {
            return res.status(404).json({ error: "Booking not found." });
        }

        res.json({ message: "Urn placement details updated successfully." });

    } catch (err) {
        console.error("Error updating beneficiary:", err);
        res.status(500).json({ error: "Failed to update urn placement details." });
    }
};

exports.approveBooking = async (req, res) => {
    const { bookingID, nicheID, bookingType } = req.body;
    const dbConn = await db.getConnection();
    await dbConn.beginTransaction();

    try {
        await dbConn.query(
            `UPDATE Booking SET bookingStatus = ? WHERE bookingID = ?`,
            ['Confirmed', bookingID]
        );

        const nicheStatus = bookingType === "PreOrder" ? "Reserved" : "Occupied";
        await dbConn.query(
            `UPDATE Niche SET status = ?, lastUpdated = NOW() WHERE nicheID = ?`,
            [nicheStatus, nicheID]
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
};


exports.archiveBooking = async (req, res) => {
    const { bookingID, nicheID } = req.body;
    const dbConn = await db.getConnection();
    await dbConn.beginTransaction();

    try {
        await dbConn.query(
            `UPDATE Booking SET bookingType = ? WHERE bookingID = ?`,
            ['Archived', bookingID]
        );

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
};

exports.getBookingApprovalDetails = async (req, res) => {
    const dbConn = await db.getConnection();
    try {
        const [rows] = await dbConn.query(
            `
        SELECT 
          b.*, 
          bene.beneficiaryID, bene.beneficiaryName, bene.dateOfBirth, bene.dateOfDeath,
          bene.birthCertificate, bene.deathCertificate, bene.birthCertificateMime, bene.deathCertificateMime,
          bene.relationshipWithApplicant,
          n.nicheID, n.blockID, n.nicheCode, n.status AS nicheStatus, n.lastUpdated,
          p.paymentID, p.amount AS paymentAmount, p.paymentMethod, p.paymentDate, p.paymentStatus,
          u.fullName AS customerName, u.contactNumber, u.email
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
        const birthCertBase64 = booking.birthCertificate?.toString('base64') || '';
        const deathCertBase64 = booking.deathCertificate?.toString('base64') || '';
        const birthCertMime = booking.birthCertificateMime || '';
        const deathCertMime = booking.deathCertificateMime || '';

        res.json({
            ...booking,
            birthCertBase64,
            deathCertBase64,
            birthCertMime,
            deathCertMime
        });
    } catch (err) {
        console.error("Error fetching booking:", err);
        res.status(500).json({ message: "Internal server error" });
    } finally {
        dbConn.release();
    }
};

