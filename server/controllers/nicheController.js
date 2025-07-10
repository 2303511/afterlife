const db = require("../db");

exports.getAllNiches = async (req, res) => {
  try {
    const [niches] = await db.query("SELECT * FROM Niche");
    res.json(niches);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch niches" });
  }
};

exports.getNicheByID = async (req, res) => {
  const nicheID = req.query.nicheID;
  if (!nicheID) {
    return res.status(400).json({ error: "Niche ID is required" });
  }

  try {
    const [niche] = await db.query("SELECT * FROM Niche WHERE nicheID = ?", [nicheID]);
    if (niche.length === 0) {
      return res.status(404).json({ error: "Niche not found" });
    }
    res.json(niche[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch niche" });
  }
};

exports.getBuildings = async (req, res) => {
  const [rows] = await db.query("SELECT * FROM Building");
  res.json(rows);
};

exports.getLevelsByBuilding = async (req, res) => {
  const [rows] = await db.query("SELECT * FROM Level WHERE buildingID = ?", [req.params.buildingID]);
  res.json(rows);
};

exports.getBlocksByLevel = async (req, res) => {
  const [rows] = await db.query("SELECT * FROM Block WHERE levelID = ?", [req.params.levelID]);
  res.json(rows);
};

exports.getNichesByBlock = async (req, res) => {
  const [rows] = await db.query("SELECT * FROM Niche WHERE blockID = ?", [req.params.blockID]);
  res.json(rows);
};

exports.updateNicheStatus = async (req, res) => {
  const { nicheID, newStatus, reason, changedBy } = req.body;

  const allowedStatuses = ["Available", "Reserved", "Occupied", "Pending"];
  if (!nicheID || !newStatus || !reason || !changedBy) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  if (!allowedStatuses.includes(newStatus)) {
    return res.status(400).json({ error: "Invalid status value." });
  }

  try {
    const [[existing]] = await db.query("SELECT status FROM Niche WHERE nicheID = ?", [nicheID]);
    if (!existing) {
      return res.status(404).json({ error: "Niche not found." });
    }

    const previousStatus = existing.status;

    await db.query(`
      UPDATE Niche SET status = ?, lastUpdated = NOW()
      WHERE nicheID = ?
    `, [newStatus, nicheID]);

    await db.query(`
      INSERT INTO NicheStatusLog (nicheID, previousStatus, newStatus, reason, changedBy)
      VALUES (?, ?, ?, ?, ?)
    `, [nicheID, previousStatus, newStatus, reason, changedBy]);

    res.status(200).json({ success: true, message: "Niche status updated and logged." });
  } catch (err) {
    console.error("Admin niche status update error:", err);
    res.status(500).json({ error: "Failed to update niche status." });
  }
};
