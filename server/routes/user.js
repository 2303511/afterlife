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
//for 2FA
const speakeasy = require('speakeasy');
//for server side validation
const validator = require("validator");


// Generate 2FA secret for new user
router.post("/generate-2fa-secret", ensureAuth, async (req, res) => {
	try {
	  const userID = req.session.userID;
	  console.log("getting a req for to generate secret for user id" , userID);
	  
	  // Generate a secret
	  const secret = speakeasy.generateSecret({
		name: "Afterlife 2FA",
		issuer: "Afterlife"
	  });
	  
	  // Store the secret temporarily (in memory or database)
	  await db.query(
		"UPDATE User SET temp2FASecret = ? WHERE userID = ?",
		[secret.base32, userID]
	  );
	  
	  console.log("Sending back secret  " , secret.base32);
	  console.log("sending back url " , secret.otpauth_url);
	  res.json({
		secret: secret.base32,
		otpauthUrl: secret.otpauth_url
	  });
	} catch (err) {
	  console.error(err);
	  res.status(500).json({ error: "Failed to generate 2FA secret" });
	}
  });



// Verify 2FA token and complete registration
router.post("/verify-2fa", ensureAuth, async (req, res) => {
	try {
	  const { token } = req.body;
	  const userID = req.session.userID;
	  console.log("received token is " , token);
	  console.log("userid to verify 2fa is " , userID);
	  
	  // Get the temporary secret
	  const [userRow] = await db.query(
		"SELECT temp2FASecret FROM User WHERE userID = ?",
		[userID]
	  );
	  
	  if (!userRow[0] || !userRow[0].temp2FASecret) {
		return res.status(400).json({ error: "No 2FA setup in progress" });
	  }
	  
	  // Verify the token
	  const verified = speakeasy.totp.verify({
		secret: userRow[0].temp2FASecret,
		encoding: 'base32',
		token: token,
		window: 1
	  });
	  
	  if (verified) {
		// Store the permanent secret and mark 2FA as enabled
		console.log("the token matches , will complete the 2fa verification now");
		await db.query(
		  "UPDATE User SET twoFASecret = ?, temp2FASecret = NULL, twoFAEnabled = TRUE WHERE userID = ?",
		  [userRow[0].temp2FASecret, userID]
		);
		
		return res.json({ success: true });
	  } else {
		return res.status(400).json({ error: "Invalid token" });
	  }
	} catch (err) {
	  console.error(err);
	  res.status(500).json({ error: "Failed to verify 2FA token" });
	}
});




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

	//server side validation of the user input from the form
	const errors = {};

	if (!username || username.length < 4 || !/^[a-zA-Z0-9_]+$/.test(username)) {
		errors.username = "Username must be at least 4 characters and contain only letters, numbers, and underscores";
	}

	if (!fullname || fullname.length < 2 || !/^[a-zA-Z\s]+$/.test(fullname)) {
		errors.fullname = "Full name must contain only letters and spaces";
	}

	if (!email || !validator.isEmail(email)) {
		errors.email = "Invalid email format";
	}

	if (!password || password.length < 8 ) {
		errors.password = "Password must be 8+ characters ";
	}

	if (!contactnumber || !/^\+?\d{8,15}$/.test(contactnumber)) {
		errors.contactnumber = "Invalid contact number";
	}

	if (!nric || !/^[STFG]\d{7}[A-Z]$/.test(nric)) {
		errors.nric = "Invalid NRIC format (Valid NRIC format e.g. S1234567A)";
	}

	if (!dob || isNaN(new Date(dob))) {
		errors.dob = "Invalid date of birth";
	} else {
		const age = new Date().getFullYear() - new Date(dob).getFullYear();
		if (age < 18) errors.dob = "You must be at least 18 years old";
	}

	if (!nationality) {
		errors.nationality = "Nationality is required";
	}

	if (!address || address.length < 5) {
		errors.address = "Address must be at least 5 characters";
	}

	if (!gender || !["Male", "Female"].includes(gender)) {
		errors.gender = "Gender must be Male or Female";
	}

	if (!postalcode || !/^\d{6}$/.test(postalcode)) {
		errors.postalcode = "Postal code must be 6 digits";
	}

	if (!unitnumber || unitnumber.length < 1) {
		errors.unitnumber = "Unit number is required";
	}

	if (Object.keys(errors).length > 0) {
		console.log("Server validation failed for register user input form" ,errors )
		return res.status(400).json({ success: false, message: "Validation failed", errors });
	}

	//check the necessary db stuff and return if smtg goes wrong 
	//check duplicate email duplicate ic
	const [emailCheck] = await db.query(
		"SELECT email FROM User WHERE email = ?",
		[email]
	  );	  
	if (emailCheck.length > 0) {
		console.log(" duplicate email");
		return res.status(400).json({ error: "Email already exists" });
	}
	console.log("no duplicate email");
	const [nricCheck] = await db.query(
		"SELECT nric FROM User WHERE nric = ?",
		[nric]
	  );
	if (nricCheck.length > 0) {
		console.log(" duplicate ic");
		return res.status(400).json({ error: "NRIC already exists" });
	}
	console.log("no duplicate ic");

	try {
		const userID = uuidv4();
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);
		const fullAddress = `${address}, ${unitnumber}, ${postalcode}`;

		const [rows] = await db.query("SELECT roleID FROM Role WHERE roleName = ?", ['Applicant']);
		const roleID = rows[0].roleID;
		
		const [result] = await db.query(
			`INSERT INTO User
			(userID, username, email, hashedPassword, salt, fullName, contactNumber, nric, dob, nationality, userAddress, gender, roleID, lastLogin, twoFAEnabled)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(),FALSE)`,
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

		// Create session for 2FA setup
		req.session.regenerate((err) => {
			if (err) {
			  console.error("Session regeneration error:", err);
			  return res.status(500).json({ error: "Registration failed" });
			}
	  
			req.session.userID = userID;
			req.session.role = 'pending'; // Temporary role for 2FA setup
			console.log("session generated with userID , " , req.session.userID);
			console.log("session generated with session role , " , req.session.role);
			
			req.session.save((saveErr) => {
			  if (saveErr) {
				console.error("Session save error:", saveErr);
				return res.status(500).json({ error: "Registration failed" });
			  }
			  
			  // Return success with redirect instruction
			  console.log("returning to register jsx to get redirected to Setup2fA");
			  res.json({ 
				success: true,
				twoFAEnabled : false, 
				redirectTo: '/setup-2fa' 
			  });
			});
		});


		//will remove this when ltr done
		//res.json({ success: true, userID });
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
			"SELECT userID, salt, hashedPassword, currentSessionID, twoFAEnabled FROM User WHERE email = ?",
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
		console.log("s - destorying old session once password match");

		//if all the password and email matches , check if 2fa setup 
		//if not setup then redirect to setup page 
		//if yes then redirect to the login2FA page to enter code 
		// Create a temporary session for either 2FA verification or setup
		req.session.regenerate(async (err) => {
			if (err) {
			  console.error("Session regeneration error:", err);
			  await conn.rollback();
			  return res.status(500).json({ error: "Session error" });
			}
	  
			req.session.userID = user.userID;
			console.log("s - pw match, req user id in session is" , req.session.userID );
			
			if (user.twoFAEnabled) {
			  // If 2FA is enabled, mark as temporary session for verification
			  console.log("s - user has 2fa setup " , req.session.userID );
			  req.session.temp2FA = true;
			  res.json({ 
				success: true, 
				twoFARequired: true,
				redirectTo: '/login-2fa'
			  });
			} else {
				console.log("s - user DO NOT HAVE  2fa setup  gonna send him to setup " , req.session.userID );
				// If 2FA is not enabled, redirect to setup page
				res.json({ 
					success: true, 
					twoFASetupRequired: true,
					redirectTo: '/setup-2fa'
					});
			}
	  
			req.session.save((saveErr) => {
			  if (saveErr) {
				console.error("Session save error:", saveErr);
				return res.status(500).json({ error: "Login failed" });
			  }
			});
		});
		

/* 		req.session.regenerate(async err => {
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
		}); */
	} catch (err) {
		console.error(err);
		await conn.rollback();
		res.status(500).json({ error: "Login Failed" });
	} finally {
		conn.release();
	}
});


//new end point to check the 2fa, the check for password and user name will be the default /login
//it will only come here if the user have 2fa setup properly and password is correct
router.post("/verify-login-2fa", async (req, res) => {
	try {
		let conn; // Declare connection at the start
		conn = await db.getConnection(); // Initialize connection
		await conn.beginTransaction();

		// 1. Check for temporary 2FA session
		if (!req.session.userID || !req.session.temp2FA) {
			return res.status(401).json({ 
				error: "Invalid session. Please login again.",
				redirectTo: '/login' 
			});
		}

	
		const { token } = req.body;
		const userID = req.session.userID;
		console.log("s - token receive is " , token);
		console.log("s - token receive for USER ID is  " , userID);

		// Get the user's 2FA secret
		const [userEmail] = await db.query(
			"SELECT email FROM User WHERE userID = ?",
			[userID]
			);

		// Get the user's 2FA secret
		const [userRow] = await db.query(
			"SELECT twoFASecret FROM User WHERE userID = ?",
			[userID]
			);
		// another check likely wont happen
		if (!userRow[0] || !userRow[0].twoFASecret) {
			return res.status(400).json({ error: "2FA not configured" });
			}

		
		// Verify the token
		const verified = speakeasy.totp.verify({
			secret: userRow[0].twoFASecret,
			encoding: 'base32',
			token: token,
			window: 1
			});

		if (verified) {
			console.log("new 2fa code match with db secret  properly");
			// Complete the login process
			const roleName = await getUserRole(userID);
			const role = roleName === "Applicant" ? "user" : roleName.toLowerCase();

			// Update session with proper role and remove temp flag
			req.session.role = role;
			req.session.temp2FA = false;

			// Update current session in DB
			const newSID = req.sessionID;
			await conn.query(
				"UPDATE User SET currentSessionID = ?, lastLogin = NOW() WHERE userID = ?",
				[newSID, userID]
				);

			// Log successful login
			const traceId = uuidv4();
			logLoginAttempt({traceId,email: userEmail, status: "SUCCESS Login (2FA verified)",req,role});

			await conn.commit();
			req.session.save(err => {
				if (err) {
					console.error("Session save error:", err);
					return res.status(500).json({ error: "Verification failed" });
				}
				res.json({ success: true, role: req.session.role });
			});
		} else {
			res.status(400).json({ error: "2FA verficiation failed" });
			}
	} catch (err) {
	  console.error(err);
	  res.status(500).json({ error: "Failed to verify 2FA token" });
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
