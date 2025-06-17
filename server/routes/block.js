const express = require('express');
const router = express.Router();
const db = require('../db');

router.get("/", async (req, res) => {
    console.log("Fetching all blocks");
    
    try {
        const [blocks] = await db.query("SELECT * from Block");
        console.log("Blocks fetched:", blocks);
        res.json(blocks);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch all blocks" });
    }
});

router.get("/getBlockByID", async (req, res) => {
    const blockID = req.query.blockID
    console.log("Fetching block by Block ID:", blockID);
    
    try {
        var block = await db.query("SELECT * from Block WHERE blockID=?", [blockID]);
        block = block?.[0];
        console.log("Block fetched:", block[0]);
        res.json(block[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch all blocks" });
    }
});

module.exports = router;