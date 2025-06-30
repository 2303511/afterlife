const express = require("express");
const router = express.Router();
const db = require("../db");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const { sessionStore } = require("../utils/sessionConfig");
const { ensureAuth, ensureRole, ensureSelfOrRole } = require("../middleware/auth.js");
//for logging
const fs = require('fs');
const path = require('path');
const os = require('os');
const logsDir = path.join(__dirname, '..', 'logs');
const logFilePath = path.join(logsDir, 'login.logs');
//for rate limiting
const rateLimit = require("express-rate-limit");
//for recaptcha
const axios = require('axios');


//define rate limit characteristic here and add middle ware to the login fucnction
//once receive post will go thru this rate limit checks before going into the login function
const loginLimiter = rateLimit({
	windowMs: 1 * 60 * 1000, // 1 min time window
	max: 6, // Max attempt tied to IP
	message: { error: 'Too many login attempts. Please try again later.' },
	standardHeaders: true, // Enables RateLimit-* headers for clients
	legacyHeaders: false, 

	//log this ip 
	handler: (req, res, next, options) => {
		const traceId = uuidv4();
		logLoginAttempt({
			traceId: traceId,
			email: req.body.email,
			status: "FAIL: Rate limit exceeded",
			req,
			role: "UNKNOWN"
		});
		//maybe return the generic error message and traceid to user
		return res.status(options.statusCode).json(options.message);
	}
});


//limit the rate for register
const registerLimiter = rateLimit({
	windowMs: 1 * 60 * 1000, // 1 min time window
	max: 3, // Max attempt tied to IP
	message: { error: 'Too many register attempts. Please try again later.' },
	standardHeaders: true, // Enables RateLimit-* headers for clients
	legacyHeaders: false, 

	//log this ip 
	handler: (req, res, next, options) => {
		const traceId = uuidv4();
		logLoginAttempt({
			traceId: traceId,
			email: req.body.email,
			status: "FAIL: Register limit exceeded",
			req,
			role: "UNKNOWN"
		});
		//maybe return the generic error message and traceid to user
		return res.status(options.statusCode).json(options.message);
	}
});

//logs login logs to /app/logs/login.logs
function logLoginAttempt({ traceId, email, status, req, role }) {
	console.log("Entering log function");

	// Create logs folder if not exists
	if (!fs.existsSync(logsDir)) {
		console.log("Creating directory");
		fs.mkdirSync(logsDir, { recursive: true });
	}


	const logEntry = {
		timestamp: new Date().toISOString(),
		traceId: traceId,
		ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
		email,
		status,
		role
	};

	const logLine = JSON.stringify(logEntry) + os.EOL;

	fs.appendFile(logFilePath, logLine, (err) => {
		if (err){
		  console.error("Failed to write login log:", err);
		} else {
		  console.log("Log to file successful");
		}
	  });
}


//recaptcha function , return the success, score , action 
//please provide it with the token , res
async function recaptchaServerCheck(recaptchaToken){
	try{
		console.log("trying to verify captcha token");
		const recaptchaSecretKey = process.env.RECAPTCHA_SECRET;
		const recaptchaResponse = await axios.post(
			`https://www.google.com/recaptcha/api/siteverify?secret=${recaptchaSecretKey}&response=${recaptchaToken}`
		);
		//get the values from the google response data and legit check it 
		const { success, score , action } = recaptchaResponse.data;
		console.log("Received things from google api for captcha");
		//return as object
		return { success, score , action }
	}catch(err){
		console.log("recaptcha login failed 1")
		throw new Error("reCAPTCHA verification failed");
	}
}




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
router.post("/register", registerLimiter, async (req, res) => {
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
		roleID,
		recaptchaToken
	} = req.body;

	//verify the recaptchaToken first 
	//console.log("Register recpatchatoken is " , recaptchaToken)
	const { success, score, action } =  await recaptchaServerCheck(recaptchaToken);
	console.log("Register success, score, action values are:", success, score, action);
	// Verify the things for this work flow 
	const isValid = success && score > 0.5 && action ==='register';
	console.log("isValid register value is:", isValid);
	if (!isValid){return res.status(400).json({ error: "recaptcha register failed" });}
	console.log("recaptcha register verficication passed");

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
router.post("/login", loginLimiter, async (req, res) => {
	console.log("User login");
	const { email, password , recaptchaToken} = req.body;
	const conn = await db.getConnection();

	// Verify reCAPTCHA first
    const { success, score, action } =  await recaptchaServerCheck(recaptchaToken);
	console.log("Login success, score, action values are:", success, score, action);
	// Verify the things for this work flow 
	const isValid = success && score > 0.5 && action ==='login';
	console.log("isValid login value is:", isValid);
	if (!isValid){return res.status(400).json({ error: "recaptcha login failed" });}
	console.log("recaptcha login verficication passed");

	// Back-end email validation
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	if (!emailRegex.test(email)) {
		return res.status(400).json({ error: "Invalid email format" });
	}
	console.log("email backend regrex verification passed");

	try {
		await conn.beginTransaction();

		const [userRow] = await conn.query(
			"SELECT userID, salt, hashedPassword, currentSessionID FROM User WHERE email = ?",
			[email]
		);
		const user = userRow[0];
		if (!user) {
			// No user found
			console.log("no user name found");
			const traceId = uuidv4();
			logLoginAttempt({traceId,email,status: "FAIL: Incorrect User",req, role :"UNKNOWN"});
			await conn.rollback();
			return res.status(401).json({ error: "Invalid credentials" });
		}

		const hashedInput = await bcrypt.hash(password, user.salt);
		if (hashedInput !== user.hashedPassword) {
			console.log("Incorret password");
			const traceId = uuidv4();
			logLoginAttempt({traceId,email,status: "FAIL: Incorrect password",req, role :"UNKNOWN"});
			console.log("incorrect password");
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

			//logs successful log in
			const traceId = uuidv4();
			logLoginAttempt({traceId,email,status: "SUCCESS",req, role :req.session.role});

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
