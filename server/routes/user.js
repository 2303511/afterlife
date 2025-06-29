const express = require("express");
const router = express.Router();
const db = require("../db");
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');

// Get user id and role in session
router.get("/me", (req, res) => {
	if (!req.session.userID) {
		return res.status(401).json({ error: "Not authenticated" });
	}
	res.json({ userID: req.session.userID, role: req.session.role });
});

// GET all users
router.get("/", async (req, res) => {
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
		fullName,
		contactNumber,
		nric,
		dob,
		nationality,
		userAddress,
		gender,
		roleID
	} = req.body;

	try {

		// Generate UUID for userID
		const userID = uuidv4();

		// Hash password
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		// Role - Applicant
		const [rows] = await db.query("SELECT roleID FROM Role WHERE roleName = ?", ['Applicant']);
		const roleID = rows[0].roleID;
		
		// Insert user 
		const [result] = await db.query(
			`INSERT INTO User
			(userID, username, email, hashedPassword, salt, fullName, contactNumber, nric, dob, nationality, userAddress, gender, roleID)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
			[
				userID,
				username,
				email,
				hashedPassword,
				salt,
				fullName,
				contactNumber,
				nric,
				dob,
				nationality,
				userAddress,
				gender,
				roleID,
			]
		);	
		
		res.json(result);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "Registration Failed" });
	}
});

// Login
router.post("/login", async (req, res) => {
	console.log("User login");
	const { email, password } = req.body;

	try {
		const [userRow] = await db.query("SELECT * FROM User WHERE email = ?", [email]);
		const user = userRow[0];

		// Re-hash user input password using the stored salt
		const hashedInput = await bcrypt.hash(password, user.salt);

		// Compare the hashed password with the one in the DB
		if (hashedInput !== user.hashedPassword) {
			return res.status(401).json({ error: "Invalid credentials" });
		}

		// Store user id and role into session
		req.session.userID = user.userID;
		
		const role = await getUserRole(user.userID);
		if (!role) {
		return res.status(500).json({ error: "User role not found" });
		}
		
		req.session.role = role === "Applicant" ? "user" : role.toLowerCase();

		console.log("this is in login server, user id:", req.session.userID);
		
		req.session.save(err => {
			if (err) {
				console.error("session save:", err);
				return res.status(500).json({ error: "Login failed" });
			}
			res.json({ role: req.session.role });
		});
		
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "Login Failed" });
	}
});

router.post("/getUserByID", async (req, res) => {
	let userID = req.body.userID;

	try {
		const [user] = await db.query("SELECT * FROM User WHERE userID = ?", [userID]);
		if (user.length === 0) return res.status(404).json({ error: 'User not found' });

		res.json(user[0]); // return user details
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: `Failed to fetch user with ID ${userID}` });
	}
});

router.post("/getUserByNRIC", async (req, res) => {
	let userNRIC = req.body.nric;

	try {
		const [user] = await db.query("SELECT * FROM User WHERE nric = ?", [userNRIC]);
		if (user.length === 0) return res.status(404).json({ message: `User with NRIC ${userNRIC} not found` });
		
		res.json(user[0]); // return user details
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: `Failed to fetch user with ID ${userNRIC}` });
	}
})

// Logout
router.post("/logout", (req, res) => {	
	req.session.destroy(err => {
		if (err) {
			console.error("Session destroy error:", err);
			return res.status(500).json({ error: "Logout failed" });
		}

		res.clearCookie("sid", { path: "/" });

		return res.status(200).json({ message: "Logged out" });
	});
});


module.exports = router;
