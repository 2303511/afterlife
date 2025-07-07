const db = require("../db");

exports.getAllPayments = async (req, res) => {
  try {
    const [payments] = await db.query("SELECT * FROM Payment");
    res.json(payments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch payments" });
  }
};

exports.getPaymentByID = async (req, res) => {
  const paymentID = req.query.paymentID;
  if (!paymentID) {
    return res.status(400).json({ error: "Payment ID is required" });
  }
  try {
    const [[payment]] = await db.query(`
      SELECT p.*, bk.paidByID
      FROM Payment AS p
      JOIN Booking AS bk ON bk.paymentID = p.paymentID
      WHERE p.paymentID = ?`, [paymentID]);

    if (!payment) return res.status(404).json({ error: "Payment not found" });

    if (
      req.session.role !== "staff" &&
      req.session.role !== "admin" &&
      payment.paidByID !== req.session.userID
    ) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const { paidByID, ...publicPayment } = payment;
    res.json(publicPayment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch payment" });
  }
};

exports.getPaymentByUserID = async (req, res) => {
  const userID = req.query.userID;
  if (!userID) {
    return res.status(400).json({ error: "User ID is required" });
  }
  try {
    const [payments] = await db.query(
      "SELECT * FROM Payment WHERE paidByID = ?", [userID]
    );
    res.json(payments.length ? payments : []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: `Failed to fetch payments for user ${userID}` });
  }
};

exports.getPaymentSummary = async (bookingID) => {
  if (!bookingID) {
    throw new Error("Booking ID is required");
  }

  const [paymentSummary] = await db.query(`
    SELECT 
      u.fullName,
      bnf.beneficiaryName,
      bl.blockName,
      lv.levelNumber,
      nc.nicheColumn,
      nc.nicheRow,
      bk.bookingType,
      p.amount,
      p.paymentDate, 
      p.paymentMethod
    FROM Booking bk
    JOIN User u ON bk.paidByID = u.userID
    JOIN Beneficiary bnf ON bk.beneficiaryID = bnf.beneficiaryID
    JOIN Niche nc ON bk.nicheID = nc.nicheID
    JOIN Block bl ON nc.blockID = bl.blockID
    JOIN Level lv ON bl.levelID = lv.levelID
    JOIN Payment p ON bk.paymentID = p.paymentID
    WHERE bk.bookingID = ?;
  `, [bookingID]);

  if (paymentSummary.length === 0) return null;
  return paymentSummary[0];
};
