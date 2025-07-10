const db = require('../db');

exports.getDashboardStats = async (req, res) => {
  try {
    const [[{ totalBookings }]] = await db.query(
      `SELECT COUNT(*) AS totalBookings FROM Booking`
    );

    const [[{ pendingNiches }]] = await db.query(
      `SELECT COUNT(*) AS pendingNiches FROM Niche WHERE status = 'Pending'`
    );

    const [[{ returningPercentage }]] = await db.query(`
      SELECT ROUND(
        (
          SELECT COUNT(*) FROM (
            SELECT paidByID FROM Booking GROUP BY paidByID HAVING COUNT(*) > 1
          ) AS returningUsers
        ) * 100.0 /
        (
          SELECT COUNT(DISTINCT paidByID) FROM Booking
        ),
        0
      ) AS returningPercentage
    `);

    const [nicheStatusCounts] = await db.query(`
      SELECT status, COUNT(*) AS count
      FROM Niche
      GROUP BY status
    `);

    res.json({
      totalBookings,
      pendingApproval: pendingNiches,
      returningClients: returningPercentage,
      nicheStatuses: nicheStatusCounts
    });
  } catch (err) {
    console.error("Dashboard stats error:", err);
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
};
