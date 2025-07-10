const db = require("../db");

exports.getAllBeneficiaries = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM Beneficiary");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch beneficiaries" });
  }
};

exports.getBeneficiaryByID = async (req, res) => {
  const beneficiaryID = req.query.beneficiaryID;
  const userID = req.session.userID;
  const role = req.session.role;

  try {
    const [[beneficiary]] = await db.query(`
      SELECT b.*, bk.paidByID
      FROM Beneficiary AS b
      JOIN Booking AS bk ON bk.beneficiaryID = b.beneficiaryID
      WHERE b.beneficiaryID = ?
    `, [beneficiaryID]);

    if (!beneficiary) {
      return res.status(404).json({ error: "Beneficiary not found" });
    }

    if (role !== "staff" && role !== "admin" && beneficiary.paidByID !== userID) {
      return res.status(403).json({ error: "Forbidden" });
    }

    res.json(beneficiary);
  } catch (err) {
    console.error("Error fetching beneficiary:", err);
    res.status(500).json({ error: "Server error" });
  }
};
