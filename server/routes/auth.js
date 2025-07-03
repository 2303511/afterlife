const express = require("express");
const db = require("../db"); // adjust as needed
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const router = express.Router();

router.post("/resetPassword", async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    return res.status(400).json({ error: "Missing token or password." });
  }

  try {
    // 1. Look up token
    const [tokens] = await db.execute(
      `SELECT userID, expiresAt, used FROM PasswordResetToken WHERE token = ?`,
      [token]
    );

    if (tokens.length === 0 || tokens[0].used || new Date(tokens[0].expiresAt) < new Date()) {
      return res.status(400).json({ error: "Invalid or expired token." });
    }

    const { userID } = tokens[0];

    // ✅ 2. Correct hashing logic
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // 3. Update user password
    await db.execute(
      `UPDATE User SET hashedPassword = ?, salt = ? WHERE userID = ?`,
      [hashedPassword, salt, userID]
    );

    // 4. Mark token as used
    await db.execute(
      `UPDATE PasswordResetToken SET used = TRUE WHERE token = ?`,
      [token]
    );

    res.json({ message: "Password reset successful." });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ error: "Failed to reset password." });
  }
});


module.exports = router;
