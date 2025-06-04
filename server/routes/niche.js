const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all niches
router.get('/', async (req, res) => {
    console.log('Fetching all niches');
    try {
        const [niches] = await db.query('SELECT * FROM Niche');
        res.json(niches);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch niches' });
    }
});

// GET niche by ID 
router.get('/getNicheById', async (req, res) => {
    const nicheID = req.query.nicheId;
    console.log('Fetching niche with ID:', nicheID);

    if (!nicheID) {
        return res.status(400).json({ error: 'Niche ID is required' });
    }

    try {
        const [niche] = await db.query('SELECT * FROM Niche WHERE nicheID = ?', [nicheID]);
        console.log('Niche fetched:', niche);

        if (niche.length === 0) {
            return res.status(404).json({ error: 'Niche not found' });
        }

        res.json(niche[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch niche' });
    }
});

module.exports = router;