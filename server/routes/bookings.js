const express = require('express');
const router = express.Router();
const db = require('../db');

router.get("/", async (req, res) => {
    console.log("Fetching bookings for user:", req.query.userId);
    const userId = req.query.userId;

    if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
    }

    try {
        const [bookings] = await db.query('SELECT * FROM Booking WHERE userId = ?', [userId]);
        res.json(bookings);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch bookings" });
    }
});

router.get("/getIndivBookings", async (req, res) => {
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

module.exports = router;