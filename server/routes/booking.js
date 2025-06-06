const express = require('express');
const router = express.Router();
const db = require('../db');

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

module.exports = router;