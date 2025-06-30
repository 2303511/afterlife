const express = require('express');
const router = express.Router();
const db = require('../db');

router.get("/", async (req, res) => {
    try {
        const [blocks] = await db.query("SELECT * from Block");
        res.json(blocks);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch all blocks" });
    }
});

router.get("/getBlockByID", async (req, res) => {
    const blockID = req.query.blockID
    
    try {
        var block = await db.query("SELECT * from Block WHERE blockID=?", [blockID]);
        block = block?.[0];
        res.json(block[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch all blocks" });
    }
});

module.exports = router;