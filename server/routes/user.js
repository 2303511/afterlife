const express = require("express");
const router = express.Router();
const db = require("../db");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const { sessionStore } = require("../utils/sessionConfig");
const { ensureAuth, ensureRole, ensureSelfOrRole } = require("../middleware/auth.js");

// Get user id and role in session
router.get("/me", ensureAuth, (req, res) => {
	if (!req.session.userID) {
		return res.status(401).json({ error: "Not authenticated" });
	}
	res.json({ userID: req.session.userID, role: req.session.role });
});

// GET all users
router.get("/", ensureAuth, ensureRole(["admin"]), async (req, res) => {
	try {
		const [users] = await db.query("SELECT * FROM User");
		res.json(users);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "Failed to fetch users" });
	}
});

// Get user role
async function getUserRole(userID) {
	try {
		const [role] = await db.query(`
			SELECT roleName 
			FROM Role r 
			INNER JOIN User u ON u.roleID = r.roleID 
			WHERE u.userID = ?
		`, [userID]);
		return role[0].roleName; 
	} catch (error) {
		console.error("Error fetching role:", error);
		throw error;
	}
};

// Register
router.post("/register", async (req, res) => {
	console.log("Register User");
	
    const {
		email,
		password,
		username,
		fullname,
		contactnumber,
		nric,
		dob,
		nationality,
		address,
		gender,
		postalcode, 
		unitnumber,
		roleID
	} = req.body;

	try {
		const userID = uuidv4();
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);
		const fullAddress = `${address}, ${unitnumber}, ${postalcode}`;

		const [rows] = await db.query("SELECT roleID FROM Role WHERE roleName = ?", ['Applicant']);
		const roleID = rows[0].roleID;
		
		const [result] = await db.query(
			`INSERT INTO User
			(userID, username, email, hashedPassword, salt, fullName, contactNumber, nric, dob, nationality, userAddress, gender, roleID, lastLogin)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
			[
				userID,
				username,
				email,
				hashedPassword,
				salt,
				fullname,
				contactnumber,
				nric,
				dob,
				nationality,
				fullAddress,
				gender,
				roleID,
			]
		);	
		
		res.json({ success: true, userID });
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "Registration Failed" });
	}
});

// Login
router.post("/login", async (req, res) => {
	console.log("User login");
	const { email, password } = req.body;
	const conn = await db.getConnection();

	try {
		await conn.beginTransaction();

		const [userRow] = await conn.query(
			"SELECT userID, salt, hashedPassword, currentSessionID FROM User WHERE email = ?",
			[email]
		);
		const user = userRow[0];
		if (!user) {
			await conn.rollback();
			return res.status(401).json({ error: "Invalid credentials" });
		}

		const hashedInput = await bcrypt.hash(password, user.salt);
		if (hashedInput !== user.hashedPassword) {
			await conn.rollback();
			return res.status(401).json({ error: "Invalid credentials" });
		}

		if (user.currentSessionID) {
			sessionStore.destroy(user.currentSessionID, err => {
				if (err) console.error("Error destroying old session:", err);
			});
		}

		req.session.regenerate(async err => {
			if (err) {
				console.error("Session regeneration error:", err);
				await conn.rollback();
				return res.status(500).json({ error: "Session error" });
			}

			req.session.userID = user.userID;
			const roleName = await getUserRole(user.userID);
			req.session.role = roleName === "Applicant" ? "user" : roleName.toLowerCase();

			const newSID = req.sessionID;
			await conn.query(
				"UPDATE User SET currentSessionID = ?, lastLogin = NOW() WHERE userID = ?",
				[newSID, user.userID]
			);

			await conn.commit();
			req.session.save(saveErr => {
				if (saveErr) {
					console.error("Session save error:", saveErr);
					return res.status(500).json({ error: "Login failed" });
				}
				res.json({ success: true, role: req.session.role });
			});
		});
	} catch (err) {
		console.error(err);
		await conn.rollback();
		res.status(500).json({ error: "Login Failed" });
	} finally {
		conn.release();
	}
});

router.get("/getUserByID", ensureAuth, ensureSelfOrRole(["admin"]), async (req, res) => {
	let userID = req.query.userID;

	try {
		const [user] = await db.query("SELECT * FROM User WHERE userID = ?", [userID]);
		if (user.length <= 0) return res.status(404).json({ error: 'User not found' });

		res.json(user[0]);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: `Failed to fetch user with ID ${userID}` });
	}
});

router.post("/getUserByNRIC", ensureAuth, ensureRole(["admin"]), async (req, res) => {
	let userNRIC = req.body.nric;

	try {
		const [user] = await db.query("SELECT * FROM User WHERE nric = ?", [userNRIC]);
		if (user.length === 0) return res.status(404).json({ message: `User with NRIC ${userNRIC} not found` });
		
		res.json(user[0]);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: `Failed to fetch user with ID ${userNRIC}` });
	}
});

// Logout
router.post("/logout", ensureAuth, async (req, res) => {	
	const uid = req.session.userID;
	req.session.destroy(async err => {
		if (err) {
			console.error("Session destroy error:", err);
			return res.status(500).json({ error: "Logout failed" });
		}

		res.clearCookie(process.env.SESSION_COOKIE_NAME || "sid");

		try {
			await db.query("UPDATE User SET currentSessionID = NULL WHERE userID = ?", [uid]);
		} catch (e) {
			console.error("Error clearing sessionID in DB:", e);
		}

		res.json({ message: "Logged out" });
	});
});

// Forget password
router.post("/forget_password", async (req, res) => {
	const { email } = req.body;

	// TODO: implement secure reset-token flow
	res.status(501).json({ error: "Not implemented" });
});

module.exports = router;
