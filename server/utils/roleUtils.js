const db = require("../db");

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

module.exports = { getUserRole };