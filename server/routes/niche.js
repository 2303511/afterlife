const express = require('express');
const router = express.Router();
const db = require('../db');

const { v4: uuidv4 } = require("uuid");

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
router.get('/getNicheByID', async (req, res) => {
    const nicheID = req.query.nicheID;
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
router.get("/levels/:buildingID", async (req, res) => {
  const [rows] = await db.query("SELECT * FROM Level WHERE buildingID = ?", [req.params.buildingID]);
  res.json(rows);
});

// Get blocks for a level
router.get("/blocks/:levelID", async (req, res) => {
  const [rows] = await db.query("SELECT * FROM Block WHERE levelID = ?", [req.params.levelID]);
  res.json(rows);
});

// Get niches for a block
router.get("/niches/:blockID", async (req, res) => {
  const [rows] = await db.query("SELECT * FROM Niche WHERE blockID = ?", [req.params.blockID]);
  res.json(rows);
});

router.post("/create-block", async (req, res) => {
  const { levelID, notes, rows, cols, status } = req.body;

  try {
    const blockID = uuidv4();

    // Insert the new block
    await db.query("INSERT INTO Block (blockID, levelID, levelNumber, notes) VALUES (?, ?, ?, ?)", 
      [blockID, levelID, 1, notes]);

    // Generate niche slots
    for (let r = 1; r <= rows; r++) {
      for (let c = 1; c <= cols; c++) {
        const nicheID = uuidv4();
        const code = `${String(r).padStart(2, '0')}-${String(c).padStart(2, '0')}`;
        await db.query(
          "INSERT INTO Niche (nicheID, blockID, nicheRow, nicheColumn, niche_code, status) VALUES (?, ?, ?, ?, ?, ?)",
          [nicheID, blockID, r, c, code, status]
        );
      }
    }

    res.json({ success: true, blockID });
  } catch (err) {
    console.error("Error creating block:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});


module.exports = router;