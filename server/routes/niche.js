const express = require('express');
const router = express.Router();
const db = require('../db');
const { v4: uuidv4 } = require("uuid");
const { ensureAuth, ensureRole } = require("../middleware/auth.js");

// GET all niches
router.get('/', ensureAuth, async (req, res) => {
    try {
        const [niches] = await db.query('SELECT * FROM Niche');
        res.json(niches);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch niches' });
    }
});

// GET niche by ID 
router.get('/getNicheByID', ensureAuth, async (req, res) => {
    const nicheID = req.query.nicheID;

    if (!nicheID) {
        return res.status(400).json({ error: 'Niche ID is required' });
    }

    try {
        const [niche] = await db.query('SELECT * FROM Niche WHERE nicheID = ?', [nicheID]);

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
router.get("/buildings", ensureAuth, async (req, res) => {
  const [rows] = await db.query("SELECT * FROM Building");
  res.json(rows);
});

// Get levels for a building
router.get("/levels/:buildingID", ensureAuth, async (req, res) => {
  const [rows] = await db.query("SELECT * FROM Level WHERE buildingID = ?", [req.params.buildingID]);
  res.json(rows);
});

// Get blocks for a level
router.get("/blocks/:levelID", ensureAuth, async (req, res) => {
  const [rows] = await db.query("SELECT * FROM Block WHERE levelID = ?", [req.params.levelID]);
  res.json(rows);
});

// Get niches for a block
router.get("/niches/:blockID", ensureAuth, async (req, res) => {
  const [rows] = await db.query("SELECT * FROM Niche WHERE blockID = ?", [req.params.blockID]);
  res.json(rows);
});

router.post("/create-block", ensureAuth, ensureRole(["staff","admin"]), async (req, res) => {
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

// admin level
router.post("/update-status", ensureAuth, ensureRole(["admin"]), async (req, res) => {
  const { nicheID, newStatus } = req.body;

  const allowedStatuses = ["Available", "Reserved", "Occupied", "Pending"];
  if (!nicheID || !newStatus || !reason) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  if (!allowedStatuses.includes(newStatus)) {
    return res.status(400).json({ error: "Invalid status value." });
  }

  if (!changedBy) {
    return res.status(401).json({ error: "Not authenticated." });
  }

  try {
    // Check if niche exists
    const [[existing]] = await db.query(`SELECT status FROM Niche WHERE nicheID = ?`, [nicheID]);
    if (!existing) {
      return res.status(404).json({ error: "Niche not found." });
    }

    const previousStatus = existing.status;

    // Update the status
    await db.query(`
      UPDATE Niche
      SET status = ?, lastUpdated = NOW()
      WHERE nicheID = ?
    `, [newStatus, nicheID]);

    // Insert into NicheStatusLog
    await db.query(`
      INSERT INTO NicheStatusLog (nicheID, previousStatus, newStatus, reason, changedBy)
      VALUES (?, ?, ?, ?, ?)
    `, [nicheID, previousStatus, newStatus, reason, changedBy]);

    res.status(200).json({ success: true, message: "Niche status updated and logged." });
  } catch (err) {
    console.error("Admin niche status update error:", err);
    res.status(500).json({ error: "Failed to update niche status." });
  }
});

module.exports = router;
