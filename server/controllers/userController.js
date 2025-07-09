// controllers/userController.js

const db = require("../db");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const bcrypt = require("bcrypt");

const { loggingFunction } = require("../utils/logger");
const { getUserRole, areCompromisedPassword } = require("../utils/authUtils");

//for logging
const logsDir = path.join(__dirname, '..', 'logs');
// log file paths
const privilegeFilePath = path.join(logsDir, 'privilege.logs');
const editAccountFilePath = path.join(logsDir, 'editAccount.logs');
const changePasswordFilePath = path.join(logsDir, 'changePassword.logs');


exports.getCurrentUser = (req, res) => {
	if (!req.session.userID) {
		return res.status(401).json({ error: "Not authenticated" });
	}
	res.json({ userID: req.session.userID, role: req.session.role });
};

exports.getAllUsers = async (req, res) => {
	try {
		const [users] = await db.query("SELECT * FROM User");

		for (const user of users) {
			const role = await getUserRole(user.userID);
			user.role = role?.toLowerCase();
		}

		res.json(users);
	} catch (err) {
		console.error("Failed to fetch users:", err);
		res.status(500).json({ error: "Failed to fetch users" });
	}
};

exports.updateUserRole = async (req, res) => {
	const { userID, role } = req.body;
	console.log("this is in update role, new role:", role);

	if (!userID || !role)
		return res.status(400).json({ error: "userID and role are required" });

	if (userID === req.session.userID){
		const traceId = uuidv4();
		loggingFunction({traceId,email: userID, status: "F - User tried to change other user's role",req,role},privilegeFilePath);
		return res.status(403).json({ error: "You cannot change your own role" });
	}

	const connection = await db.getConnection();
	try {
		await connection.beginTransaction();

		const roleName = role.charAt(0).toUpperCase() + role.slice(1);
		const [roleRows] = await connection.query(
			"SELECT roleID FROM Role WHERE roleName = ?",
			[roleName]
		);

		if (roleRows.length === 0) {
			await connection.rollback();
			return res.status(400).json({ error: "Role not found in Role table" });
		}

		const newRoleID = roleRows[0].roleID;

		const [result] = await connection.query(
			"UPDATE User SET roleID = ? WHERE userID = ?",
			[newRoleID, userID]
		);

		if (result.affectedRows === 0) {
			await connection.rollback();
			return res.status(404).json({ error: "User not found" });
		}

		await connection.commit();
		res.json({ message: "Role updated successfully" });
	} catch (err) {
		await connection.rollback();
		console.error("Failed to update role:", err);
		res.status(500).json({ error: "Failed to update role" });
	} finally {
		connection.release();
	}
};

exports.getUserByID = async (req, res) => {
	let userID = req.query.userID;

	try {
		const [user] = await db.query("SELECT * FROM User WHERE userID = ?", [userID]);
		if (user.length <= 0) return res.status(404).json({ error: 'User not found' });

		res.json(user[0]);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: `Failed to fetch user with ID ${userID}` });
	}
};

exports.getUserByNRIC = async (req, res) => {
	let userNRIC = req.body.nric;

	try {
		const [user] = await db.query("SELECT * FROM User WHERE nric = ?", [userNRIC]);
		if (user.length === 0) return res.status(404).json({ message: `User with NRIC ${userNRIC} not found` });

		console.log("we got user details!!");
		console.log(user[0]);

		res.json(user[0]); // return user details
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: `Failed to fetch user with ID ${userNRIC}` });
	}
};

exports.findExistingUser = async (req, res) => {
	const { attr, value } = req.query;

	console.log(`now tracking attr: ${attr} and value: ${value}`)

	try {
		const [entry] = await db.query(`SELECT * FROM User WHERE ${attr} = ?`, [ value ]);
		console.log("this is entry");
		console.log(entry);
		res.json(entry); // return user details
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: `Failed to fetch user with ID ${userID}` });
	}
};

exports.editAccount = async (req, res) => {
	const userID = req.session.userID;
	if (!userID) {
		return res.status(401).json({ error: "Unauthorized: Not logged in" });
	}

	const { username, fullName, email, contactNumber, userAddress } = req.body;
	const connection = await db.getConnection();

	const role = await getUserRole(userID);


	try {
		await connection.beginTransaction();

		// Check if email or username is taken by others
		if (email) {
			const [emailRows] = await connection.query(
				"SELECT userID FROM User WHERE email = ? AND userID <> ?",
				[email, userID]);
			if (emailRows.length > 0) {
				await connection.rollback();
				const traceId = uuidv4();
				loggingFunction({traceId,email: email, status: "F - User tried to change to a email that already exist",req,role},editAccountFilePath);
				return res.status(400).json({ error: "Please contact admin over this Trace ID: ${traceId}" });
			}
		}

		// Update only the fields provided
		const fields = [];
		const values = [];

		if (username) {
			fields.push("username = ?");
			values.push(username);
		}
		if (fullName) {
			fields.push("fullName = ?");
			values.push(fullName);
		}
		if (email) {
			fields.push("email = ?");
			values.push(email);
		}
		if (contactNumber) {
			fields.push("contactNumber = ?");
			values.push(contactNumber);
		}
		if (userAddress) {
			fields.push("userAddress = ?");
			values.push(userAddress);
		}

		if (fields.length === 0) {
			await connection.rollback();
			return res.status(400).json({ error: "No fields to update" });
		}

		values.push(userID);
		const sql = `UPDATE User SET ${fields.join(", ")} WHERE userID = ?`;
		await connection.query(sql, values);

		await connection.commit();
		console.log("Account details updated successfully");

		const traceId = uuidv4();
		loggingFunction({traceId,email: email, status: "S - User edited profile",req,role},editAccountFilePath);

		res.json({ message: "Account details updated successfully" });
	} catch (err) {
		await connection.rollback();
		console.error("Edit account error:", err);
		res.status(500).json({ error: "Failed to update account details" });
	} finally {
		connection.release();
	}
};

exports.changePassword = async (req, res) => {
	const userID = req.session.userID;
	if (!userID) {
		return res.status(401).json({ error: "Unauthorized: Not logged in" });
	}

	const { oldPassword, newPassword } = req.body;
	if (!oldPassword || !newPassword) {
		return res
		.status(400)
		.json({ error: "Old password and new password are required" });
	}

	const connection = await db.getConnection();

	const role = await getUserRole(userID);



	try {
		await connection.beginTransaction();

		const [rows] = await connection.query(
			"SELECT salt, hashedPassword FROM User WHERE userID = ?",
			[userID]
		);
		if (rows.length === 0) {
			await connection.rollback();
			return res.status(404).json({ error: "User not found" });
		}
		const user = rows[0];

		// check old password
		const hashedOldInput = await bcrypt.hash(oldPassword, user.salt);
		if (hashedOldInput !== user.hashedPassword) {
			await connection.rollback();
			const traceId = uuidv4();
			loggingFunction({traceId,email: userID, status: "F - Old PW is incorrect",req,role},changePasswordFilePath);
			return res.status(401).json({ error: "Old password is incorrect" });
		}

		// check if new is same as old password
		if (oldPassword === newPassword) {
			const traceId = uuidv4();
			loggingFunction({traceId,email: userID, status: "F - User tried to change to old PW",req,role},changePasswordFilePath);


			return res
			.status(400)
			.json({ error: "New password cannot be the same as the old password" });
		}

		// check for compromised password
		if (areCompromisedPassword(newPassword)) {
			await connection.rollback();

			const traceId = uuidv4();
			loggingFunction({traceId,email: userID, status: "F - User tried to change to a compromise PW",req,role},changePasswordFilePath);


			return res.status(400).json({ error: "New password has been compromised in a data breach. Please choose a different password." });
		}

		// hash new password
		const saltRounds = 10;
		const newSalt = await bcrypt.genSalt(saltRounds);
		const hashedNewPassword = await bcrypt.hash(newPassword, newSalt);

		// update password
		await connection.query(
			"UPDATE User SET salt = ?, hashedPassword = ? WHERE userID = ?",
			[newSalt, hashedNewPassword, userID]
		);

		await connection.commit();
		const traceId = uuidv4();
		loggingFunction({traceId,email: userID, status: "S - PW change success",req,role},changePasswordFilePath);


		res.json({ message: "Password updated successfully" });
	} catch (err) {
		await connection.rollback();
		console.error("Change password error:", err);
		res.status(500).json({ error: "Failed to change password" });
	} finally {
		connection.release();
	}
};

