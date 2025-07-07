const db = require("../db");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");

const { logLoginAttempt } = require("../utils/logger");
const { recaptchaServerCheck } = require("../utils/recaptcha");
const { sessionStore } = require("../utils/sessionConfig");

//for recaptcha
const axios = require('axios');
//for 2FA
const speakeasy = require('speakeasy');
//for server side validation


exports.generate2FASecret = async (req, res) => {
    try {
        const userID = req.session.userID;
        console.log("Generating 2FA secret for user ID:", userID);

        const secret = speakeasy.generateSecret({
            name: "Afterlife 2FA",
            issuer: "Afterlife",
        });

        await db.query(
            "UPDATE User SET temp2FASecret = ? WHERE userID = ?",
            [secret.base32, userID]
        );

        console.log("Generated secret:", secret.base32);
        console.log("OTP Auth URL:", secret.otpauth_url);

        res.json({
            secret: secret.base32,
            otpauthUrl: secret.otpauth_url,
        });
    } catch (err) {
        console.error("2FA generation error:", err);
        res.status(500).json({ error: "Failed to generate 2FA secret" });
    }
};

exports.verify2FAToken = async (req, res) => {
    try {
        const { token } = req.body;
        const userID = req.session.userID;

        console.log("Received token:", token);
        console.log("Verifying 2FA for user ID:", userID);

        const [userRow] = await db.query(
            "SELECT temp2FASecret FROM User WHERE userID = ?",
            [userID]
        );

        if (!userRow[0] || !userRow[0].temp2FASecret) {
            return res.status(400).json({ error: "No 2FA setup in progress" });
        }

        const verified = speakeasy.totp.verify({
            secret: userRow[0].temp2FASecret,
            encoding: "base32",
            token,
            window: 1,
        });

        if (verified) {
            console.log("2FA token verified. Completing setup.");

            await db.query(
                "UPDATE User SET twoFASecret = ?, temp2FASecret = NULL, twoFAEnabled = TRUE WHERE userID = ?",
                [userRow[0].temp2FASecret, userID]
            );

            return res.json({ success: true });
        } else {
            return res.status(400).json({ error: "Invalid token" });
        }
    } catch (err) {
        console.error("2FA verification error:", err);
        res.status(500).json({ error: "Failed to verify 2FA token" });
    }
};

exports.registerUser = async (req, res) => {
    const {
        email, password, username, fullname, contactnumber, nric, dob,
        nationality, address, gender, postalcode, unitnumber, recaptchaToken
    } = req.body;

    const { success, score, action } = await recaptchaServerCheck(recaptchaToken);
    if (!(success && score > 0.5 && action === "register")) {
        return res.status(400).json({ error: "recaptcha register failed" });
    }
    console.log("reCAPTCHA passed during registration");

    // Validate inputs
    const errors = {};
    if (!username || username.length < 4 || !/^[a-zA-Z0-9_]+$/.test(username))
        errors.username = "Username must be at least 4 characters and contain only letters, numbers, and underscores";

    if (!fullname || fullname.length < 2 || !/^[a-zA-Z\s]+$/.test(fullname))
        errors.fullname = "Full name must contain only letters and spaces";

    if (!email || !validator.isEmail(email)) errors.email = "Invalid email format";
    if (!password || password.length < 8) errors.password = "Password must be 8+ characters";
    if (!contactnumber || !/^\+?\d{8,15}$/.test(contactnumber)) errors.contactnumber = "Invalid contact number";
    if (!nric || !/^[STFG]\d{7}[A-Z]$/.test(nric)) errors.nric = "Invalid NRIC format (e.g. S1234567A)";
    if (!dob || isNaN(new Date(dob))) errors.dob = "Invalid date of birth";
    else if (new Date().getFullYear() - new Date(dob).getFullYear() < 18) errors.dob = "You must be at least 18";

    if (!nationality) errors.nationality = "Nationality is required";
    if (!address || address.length < 5) errors.address = "Address must be at least 5 characters";
    if (!gender || !["Male", "Female"].includes(gender)) errors.gender = "Gender must be Male or Female";
    if (!postalcode || !/^\d{6}$/.test(postalcode)) errors.postalcode = "Postal code must be 6 digits";
    if (!unitnumber || unitnumber.length < 1) errors.unitnumber = "Unit number is required";

    if (Object.keys(errors).length > 0)
        return res.status(400).json({ success: false, message: "Validation failed", errors });

    try {
        const [existingUsers] = await db.query(
            `SELECT username, email, contactNumber FROM User WHERE username = ? OR email = ? OR contactNumber = ?`,
            [username, email, contactnumber]
        );

        if (existingUsers.length > 0) {
            const existing = existingUsers[0];
            if (existing.username === username) return res.status(409).json({ error: "Username is already taken." });
            if (existing.email === email) return res.status(409).json({ error: "Email is already registered." });
            if (existing.contactNumber === contactnumber) return res.status(409).json({ error: "Contact number is already in use." });
        }

        const userID = uuidv4();
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const fullAddress = `${address}, ${unitnumber}, ${postalcode}`;
        const [rows] = await db.query("SELECT roleID FROM Role WHERE roleName = ?", ["Applicant"]);
        const roleID = rows[0].roleID;

        await db.query(
            `INSERT INTO User
			(userID, username, email, hashedPassword, salt, fullName, contactNumber, nric, dob, nationality, userAddress, gender, roleID, lastLogin, twoFAEnabled)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), FALSE)`,
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

        req.session.regenerate((err) => {
            if (err) {
                console.error("Session regeneration error:", err);
                return res.status(500).json({ error: "Registration failed" });
            }

            req.session.userID = userID;
            req.session.role = "pending"; // For 2FA setup

            req.session.save((saveErr) => {
                if (saveErr) {
                    console.error("Session save error:", saveErr);
                    return res.status(500).json({ error: "Registration failed" });
                }
                res.json({ success: true, twoFAEnabled: false, redirectTo: "/setup-2fa" });
            });
        });
    } catch (err) {
        console.error("Registration error:", err);
        res.status(500).json({ error: "Registration Failed" });
    }
};

exports.loginUser = async (req, res) => {
    console.log("User login");
    const { email, password, recaptchaToken } = req.body;
    const conn = await db.getConnection();

    // Verify reCAPTCHA first
    const { success, score, action } = await recaptchaServerCheck(recaptchaToken);
    console.log("Login success, score, action values are:", success, score, action);
    const isValid = success && score > 0.5 && action === "login";
    console.log("isValid login value is:", isValid);
    if (!isValid) return res.status(400).json({ error: "recaptcha login failed" });

    console.log("reCAPTCHA login verification passed");

    // Back-end email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email format" });
    }
    console.log("Email backend regex verification passed");

    try {
        await conn.beginTransaction();

        const [userRow] = await conn.query(
            "SELECT userID, salt, hashedPassword, currentSessionID, twoFAEnabled FROM User WHERE email = ?",
            [email]
        );

        const user = userRow[0];
        if (!user) {
            console.log("No user found");
            const traceId = uuidv4();
            logLoginAttempt({ traceId, email, status: "FAIL: Incorrect User", req, role: "UNKNOWN" });
            await conn.rollback();
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const hashedInput = await bcrypt.hash(password, user.salt);
        if (hashedInput !== user.hashedPassword) {
            console.log("Incorrect password");
            const traceId = uuidv4();
            logLoginAttempt({ traceId, email, status: "FAIL: Incorrect password", req, role: "UNKNOWN" });
            await conn.rollback();
            return res.status(401).json({ error: "Invalid credentials" });
        }

        if (user.currentSessionID) {
            sessionStore.destroy(user.currentSessionID, (err) => {
                if (err) console.error("Error destroying old session:", err);
            });
        }
        console.log("s - destroying old session once password matches");

        // Save latest login time
        await db.query(`UPDATE User SET lastLogin = NOW() WHERE userID = ?`, [user.userID]);

        // Create temporary session for either 2FA verification or setup
        req.session.regenerate(async (err) => {
            if (err) {
                console.error("Session regeneration error:", err);
                await conn.rollback();
                return res.status(500).json({ error: "Session error" });
            }

            req.session.userID = user.userID;
            console.log("s - pw match, req user id in session is", req.session.userID);

            if (user.twoFAEnabled) {
                console.log("s - user has 2fa setup", req.session.userID);
                req.session.temp2FA = true;
                res.json({
                    success: true,
                    twoFARequired: true,
                    redirectTo: "/login-2fa",
                });
            } else {
                console.log("s - user DOES NOT HAVE 2fa setup, sending to setup", req.session.userID);
                res.json({
                    success: true,
                    twoFASetupRequired: true,
                    redirectTo: "/setup-2fa",
                });
            }

            req.session.save((saveErr) => {
                if (saveErr) {
                    console.error("Session save error:", saveErr);
                    return res.status(500).json({ error: "Login failed" });
                }
            });
        });

        /* 
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
        */
    } catch (err) {
        console.error(err);
        await conn.rollback();
        res.status(500).json({ error: "Login Failed" });
    } finally {
        conn.release();
    }
};


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

//new end point to check the 2fa, the check for password and user name will be the default /login
//it will only come here if the user have 2fa setup properly and password is correct
exports.verifyLogin2FA = async (req, res) => {
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
        console.log("s - token receive is ", token);
        console.log("s - token receive for USER ID is  ", userID);

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
            logLoginAttempt({ traceId, email: userEmail, status: "SUCCESS Login (2FA verified)", req, role });

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
};

exports.logoutUser = async (req, res) => {
	const uid = req.session.userID;

	req.session.destroy(async (err) => {
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
};

exports.forgetPassword = async (req, res) => {
	// Forget password
	const { email } = req.body;

	try {
		const [userRow] = await db.query("SELECT * FROM User WHERE email = ?", [email]);
		const user = userRow[0];

		if (!user) {
			return res.status(401).json({
				error: "If that e-mail is registered, a reset link has been sent.",
			});
		}

		const response = await axios.post("/api/email/sendResetPassword", {
			to: email,
			link: "replace this link with reset password link",
		});

		// Optionally respond with status from mail API
		res.json({ message: "Password reset email sent" });
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "Failed to send email" });
	}
};

// Controller: Reset password
exports.resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
        return res.status(400).json({ error: "Missing token or password." });
    }

    try {
        const [tokens] = await db.execute(
            `SELECT userID, expiresAt, used FROM PasswordResetToken WHERE token = ?`,
            [token]
        );

        if (
            tokens.length === 0 ||
            tokens[0].used ||
            new Date(tokens[0].expiresAt) < new Date()
        ) {
            return res.status(400).json({ error: "Invalid or expired token." });
        }

        const { userID } = tokens[0];
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await db.execute(
            `UPDATE User SET hashedPassword = ?, salt = ? WHERE userID = ?`,
            [hashedPassword, salt, userID]
        );

        await db.execute(
            `UPDATE PasswordResetToken SET used = TRUE WHERE token = ?`,
            [token]
        );

        res.json({ message: "Password reset successful." });
    } catch (err) {
        console.error("Reset password error:", err);
        res.status(500).json({ error: "Failed to reset password." });
    }
}

