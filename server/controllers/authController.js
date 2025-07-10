const db = require("../db");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");

const { loggingFunction } = require("../utils/logger");
const { recaptchaServerCheck } = require("../utils/recaptcha");
const { sessionStore } = require("../utils/sessionConfig");
const { getUserRole, areCompromisedPassword } = require("../utils/authUtils");

const { encrypt, decrypt} = require("../utils/authUtils")

//for recaptcha
const axios = require('axios');
//for 2FA
const speakeasy = require('speakeasy');
//for server side validation
const validator = require("validator");

//for logging
const path = require('path');
const logsDir = path.join(__dirname, '..', 'logs');

// log filepaths
const twofaFilePath = path.join(logsDir, 'twofa.logs');
const registerFilePath = path.join(logsDir, 'register.logs');
const loginFilePath = path.join(logsDir, 'login.logs');
const reCaptchaFilePath = path.join(logsDir, 'reCAPTCHA.logs');
const forgotPasswordFilePath = path.join(logsDir, 'forgotPassword.logs');


// got some logging function
exports.generate2FASecret = async (req, res) => {
    try {
        const userID = req.session.userID;
        console.log("getting a req for to generate secret for user id", userID);

        // Generate a secret
        const secret = speakeasy.generateSecret({
            name: "Afterlife 2FA",
            issuer: "Afterlife"
        });

        // Store the secret temporarily (in memory or database)
        await db.query(
            "UPDATE User SET temp2FASecret = ? WHERE userID = ?",
            [encrypt(secret.base32), userID]
        );

        //console.log("Sending back secret  " , secret.base32);
        //console.log("sending back url " , secret.otpauth_url);


        // Log 2fa set up attemept
        const traceId = uuidv4();
        loggingFunction({ traceId, email: userID, status: "S - Temp 2FA secret generated", req, role: "UNKNOWN" }, twofaFilePath);


        res.json({
            secret: secret.base32,
            otpauthUrl: secret.otpauth_url
        });
    } catch (err) {
        console.error(err);
        const traceId = uuidv4();
        loggingFunction({ traceId, email: userID, status: "F - Temp 2FA secret generation FAILED", req, role: "UNKNOWN" }, twofaFilePath);
        res.status(500).json({ error: "Failed to generate 2FA secret" });
    }
};

exports.verify2FAToken = async (req, res) => {
    try {
        const { token } = req.body;
        const userID = req.session.userID;
        console.log("received token is ", token);
        console.log("userid to verify 2fa is ", userID);

        // Get the temporary secret
        const [userRow] = await db.query(
            "SELECT temp2FASecret FROM User WHERE userID = ?",
            [userID]
        );

        if (!userRow[0] || !userRow[0].temp2FASecret) {
            return res.status(400).json({ error: "No 2FA setup in progress" });
        }

        temp2FASecret = decrypt(userRow[0].temp2FASecret)

        // Verify the token
        const verified = speakeasy.totp.verify({
            secret: temp2FASecret,
            encoding: 'base32',
            token: token,
            window: 1
        });

        const role = await getUserRole(userID);
        if (verified) {
            // Store the permanent secret and mark 2FA as enabled
            console.log("the token matches , will complete the 2fa verification now");
            await db.query(
                "UPDATE User SET twoFASecret = ?, temp2FASecret = NULL, twoFAEnabled = TRUE WHERE userID = ?",
                [userRow[0].temp2FASecret, userID]
            );

            // Log successful 2fa verification
            const traceId = uuidv4();
            loggingFunction({ traceId, email: userID, status: "S - 2FA set up successfully", req, role }, twofaFilePath);
            const traceId2 = uuidv4();
            loggingFunction({ traceId2, email: userID, status: "S - User created successfully", req, role }, registerFilePath);

            return res.json({ success: true });
        } else {

            const traceId = uuidv4();
            loggingFunction({ traceId, email: userID, status: "F - 2FA FAILED set up", req, role }, twofaFilePath);


            return res.status(400).json({ error: "Invalid token" });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to verify 2FA token" });
    }
};

exports.registerUser = async (req, res) => {
    const {
        email, password, username, fullname, contactnumber, nric, dob,
        nationality, address, gender, postalcode, unitnumber, roleID, recaptchaToken
    } = req.body;

    //verify the recaptchaToken first 
    //console.log("Register recpatchatoken is " , recaptchaToken)
    const { success, score, action } = await recaptchaServerCheck(recaptchaToken);
    console.log("Register success, score, action values are:", success, score, action);
    // Verify the things for this work flow 
    const isValid = success && score > 0.5 && action === 'register';
    console.log("isValid register value is:", isValid);
    if (!isValid) {
        const traceId = uuidv4();
        loggingFunction({ traceId, email: email, status: "F - Register reCAPTCHA failed", req, role: "UNKNOWN" }, reCaptchaFilePath);
        return res.status(400).json({ error: "recaptcha register failed" });
    }
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

    if (!password || password.length < 8) {
        errors.password = "Password must be 8+ characters ";
    }
    if (areCompromisedPassword(password)) {
        errors.password = "Password chosen has been compromised in a data breach. Please choose a different password.";
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
        console.log("Server validation failed for register user input form", errors)
        return res.status(400).json({ success: false, message: "Validation failed", errors });
    }

    try {
        // Check for duplicates
        const [existingUsers] = await db.query(
            `SELECT username, email, contactNumber FROM User 
                     WHERE username = ? OR email = ? OR contactNumber = ?`,
            [username, email, contactnumber]
        );

        if (existingUsers.length > 0) {
            const existing = existingUsers[0];

            if (existing.username === username) {
                const traceId = uuidv4();
                loggingFunction({ traceId, email: "CLASH WITH EXISTING USER", status: "F - User selected the same username", req, role: "UNKNOWN" }, registerFilePath);
                return res.status(409).json({ error: `Please contact admin over this Trace ID: ${traceId}` });
            }
            if (existing.email === email) {
                const traceId = uuidv4();
                loggingFunction({ traceId, email: "CLASH WITH EXISTING USER", status: "F - User seleted the same email", req, role: "UNKNOWN" }, registerFilePath);
                return res.status(409).json({ error: `Please contact admin over this Trace ID: ${traceId}` });
            }
            if (existing.contactNumber === contactnumber) {
                const traceId = uuidv4();
                loggingFunction({ traceId, email: "CLASH WITH EXISTING USER", status: "F - User selected the same contact number", req, role: "UNKNOWN" }, registerFilePath);
                return res.status(409).json({ error: `Please contact admin over this Trace ID: ${traceId}` });
            }
        }

        // Generate UUID for userID
        const userID = uuidv4();
        const salt = await bcrypt.genSalt(12);
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
            console.log("session generated with userID , ", req.session.userID);
            console.log("session generated with session role , ", req.session.role);

            req.session.save((saveErr) => {
                if (saveErr) {
                    console.error("Session save error:", saveErr);
                    return res.status(500).json({ error: "Registration failed" });
                }

                // Return success with redirect instruction
                console.log("returning to register jsx to get redirected to Setup2fA");
                const traceId = uuidv4();
                loggingFunction({ traceId, email: email, status: "S - User successfully created", req, role: req.session.role }, registerFilePath)

                res.json({
                    success: true,
                    twoFAEnabled: false,
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
};

exports.loginUser = async (req, res) => {
    console.log("User login");
    const { email, password, recaptchaToken } = req.body;
    const conn = await db.getConnection();

    // Verify reCAPTCHA first
    const { success, score, action } = await recaptchaServerCheck(recaptchaToken);
    console.log("Login success, score, action values are:", success, score, action);
    // Verify the things for this work flow 
    const isValid = success && score > 0.5 && action === 'login';
    console.log("isValid login value is:", isValid);
    if (!isValid) {
        const traceId = uuidv4();
        loggingFunction({ traceId, email: email, status: "F - Login reCAPTCHA failed", req, role: "UNKNOWN" }, reCaptchaFilePath);
        return res.status(400).json({ error: "recaptcha login failed" });
    }
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
            loggingFunction({ traceId, email, status: "F - User not found", req, role: "UNKNOWN" }, loginFilePath);
            await conn.rollback();
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const hashedInput = await bcrypt.hash(password, user.salt);
        if (hashedInput !== user.hashedPassword) {
            console.log("Incorret password");
            const traceId = uuidv4();
            loggingFunction({ traceId, email, status: "F - Incorrect password", req, role: "UNKNOWN" }, loginFilePath);
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

        // save latest login time
        await db.query(`UPDATE User SET lastLogin = NOW() WHERE userID = ?`, [user.userID]);

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
            console.log("s - pw match, req user id in session is", req.session.userID);

            if (user.twoFAEnabled) {
                // If 2FA is enabled, mark as temporary session for verification
                console.log("s - user has 2fa setup ", req.session.userID);
                req.session.temp2FA = true;
                const traceId = uuidv4();
                loggingFunction({ traceId, email, status: "S - Credentials right, verifying 2FA", req, role: "UNKNOWN" }, loginFilePath);
                res.json({
                    success: true,
                    twoFARequired: true,
                    redirectTo: '/login-2fa'
                });
            } else {
                console.log("s - user DO NOT HAVE  2fa setup  gonna send him to setup ", req.session.userID);
                const traceId = uuidv4();
                loggingFunction({ traceId, email, status: "S - Credentials right, no 2FA", req, role: "UNKNOWN" }, loginFilePath);
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
                    loggingFunction({traceId,email,status: "SUCCESS",req, role :req.session.role});
        
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
        const [emailRow] = await db.query(
            "SELECT email FROM User WHERE userID = ?",
            [userID]
        );

        const userEmail = emailRow[0]?.email || "UNKNOWN";

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
            secret: decrypt(userRow[0].twoFASecret),
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
            loggingFunction({ traceId, email: userEmail, status: "S - Login (2FA verified)", req, role }, twofaFilePath);
            const traceId1 = uuidv4();
            loggingFunction({ traceId1, email: userEmail, status: "S - Login (2FA verified)", req, role }, loginFilePath);

            await conn.commit();
            req.session.save(err => {
                if (err) {
                    console.error("Session save error:", err);
                    return res.status(500).json({ error: "Verification failed" });
                }
                res.json({ success: true, role: req.session.role });
            });
        } else {
            const traceId = uuidv4();
            loggingFunction({ traceId, email: userEmail, status: "F - Login (2FA FAILED)", req, role }, twofaFilePath);
            res.status(400).json({ error: "2FA verficiation failed" });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to verify 2FA token" });
    }
};

exports.logoutUser = async (req, res) => {
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
};

exports.forgetPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const [userRow] = await db.query("SELECT * FROM User WHERE email = ?", [email]);
        const user = userRow[0];
        const role = user?.role || "UNKNOWN";

        if (!user) {

            return res.status(401).json({ error: "If that e-mail is registered, a reset link has been sent." });
        }

        const traceId = uuidv4();
        loggingFunction({ traceId, email: email, status: "S - Forgot PW initiated for this email", req, role }, forgotPasswordFilePath);

        const res = await axios.post('/api/email/sendResetPassword', {
            to: email,
            link: "replace this link with reset password link"
        });


    } catch (err) {
        console.error(err);
        const traceId = uuidv4();
        loggingFunction({ traceId, email: email, status: "F - Failed to send email for forgot PW", req, role }, forgotPasswordFilePath);
        res.status(500).json({ error: "Failed to send email" });
    }
};

// Controller: Reset password
exports.resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
        return res.status(400).json({ error: "Missing token or password." });
    }

    if (areCompromisedPassword(newPassword)) {
        return res.status(400).json({ error: "The 'new password' you just entered has been exposed by a data breach. Please choose a different password." });
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
        // ✅ 2. Check if new password is compromised
        const { userID } = tokens[0];

        // ✅ 2. Correct hashing logic
        const salt = await bcrypt.genSalt(12);
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
}

