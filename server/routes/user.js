const express = require('express');
const router = express.Router();
const { ensureAuth, ensureRole, ensureSelfOrRole } = require("../middleware/auth.js");

 const { 
	getCurrentUser, 
	getAllUsers,
	updateUserRole,
	getUserByID,
	getUserByNRIC,
	findExistingUser,
	editAccount,
	changePassword
} = require("../controllers/userController");

// Get user id and role in session
router.get("/me", ensureAuth, getCurrentUser);

// GET all users
router.get("/all_users", ensureAuth, ensureRole(["admin"]), getAllUsers);

// Update user role
router.post("/update_role", ensureAuth, ensureRole(["admin"]), updateUserRole);

router.get("/getUserByID", ensureAuth, ensureSelfOrRole(["admin"]), getUserByID);

router.post("/getUserByNRIC", ensureAuth, ensureRole(["staff", "admin"]), getUserByNRIC);

router.get("/findExistingUser", findExistingUser); 

router.post("/edit_account", ensureAuth, editAccount);

router.post("/change_password", ensureAuth, changePassword);
	
module.exports = router;


