const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all payments
router.get('/', async (req, res) => {
    console.log('Fetching all payments');
    try {
        const [payments] = await db.query('SELECT * FROM Payment');
        res.json(payments);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch payments' });
    }
});

// GET payment by ID
router.get('/getPaymentByID', async (req, res) => {
    const paymentID = req.query.paymentId;
    console.log('Fetching payment with ID:', paymentID);

    if (!paymentID) {  
        return res.status(400).json({ error: 'Payment ID is required' });
    }

    try {
        const [payment] = await db.query('SELECT * FROM payment WHERE paymentID = ?', [paymentID]);
        console.log('Payment fetched:', payment);
        
        if (payment.length === 0) {
            return res.status(404).json({ error: 'Payment not found' });
        }
        
        res.json(payment[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch payment' });
    }
});

module.exports = router;