const db = require('../db');

exports.getAllBlocks = async (req, res) => {
  try {
    const [blocks] = await db.query("SELECT * FROM Block");
    res.json(blocks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch all blocks" });
  }
};

exports.getBlockByID = async (req, res) => {
  const blockID = req.query.blockID;

  if (!blockID) {
    return res.status(400).json({ error: "blockID is required" });
  }

  try {
    const [block] = await db.query("SELECT * FROM Block WHERE blockID = ?", [blockID]);
    if (block.length === 0) {
      return res.status(404).json({ error: "Block not found" });
    }
    res.json(block[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch block" });
  }
};
