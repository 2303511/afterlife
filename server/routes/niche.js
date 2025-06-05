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

// Get all buildings
router.get("/buildings", async (req, res) => {
  const [rows] = await db.query("SELECT * FROM Building");
  res.json(rows);
});

// Get levels for a building
router.get("/levels/:buildingId", async (req, res) => {
  const [rows] = await db.query("SELECT * FROM Level WHERE buildingID = ?", [req.params.buildingId]);
  res.json(rows);
});

// Get blocks for a level
router.get("/blocks/:levelId", async (req, res) => {
  const [rows] = await db.query("SELECT * FROM Block WHERE levelID = ?", [req.params.levelId]);
  res.json(rows);
});

// Get niches for a block
router.get("/niches/:blockId", async (req, res) => {
  const [rows] = await db.query("SELECT * FROM Niche WHERE blockID = ?", [req.params.blockId]);
  res.json(rows);
});


module.exports = router;