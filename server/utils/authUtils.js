const db = require("../db");
//for db temp2FA encryption
const crypto = require("crypto");
const ENC_KEY = Buffer.from(process.env.ENCRYPTION_KEY, "hex"); // 64-char hex = 32 bytes
const IV_LENGTH = 12; 

const fs = require("fs");
const path = require("path");
// compromised password 
const denylistPath = path.join(__dirname, '../compromised.txt');
const denylist = new Set(
    fs.readFileSync(denylistPath, 'utf-8')
        .split(/\r?\n/)
        .map(p => p.trim().toLowerCase())
        .filter(Boolean)
);

function areCompromisedPassword(password) {
    return denylist.has(password.toLowerCase());
}

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

//encrypt and decrypt function
function encrypt(text) {
	const iv = crypto.randomBytes(IV_LENGTH);
	const cipher = crypto.createCipheriv("aes-256-gcm", ENC_KEY, iv);

	const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
	const tag = cipher.getAuthTag();

	return iv.toString("hex") + ":" + tag.toString("hex") + ":" + encrypted.toString("hex");
}
  
function decrypt(encryptedText) {
	const [ivHex, tagHex, dataHex] = encryptedText.split(":");

	const iv = Buffer.from(ivHex, "hex");
	const tag = Buffer.from(tagHex, "hex");
	const encrypted = Buffer.from(dataHex, "hex");

	const decipher = crypto.createDecipheriv("aes-256-gcm", ENC_KEY, iv);
	decipher.setAuthTag(tag);

	const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
	return decrypted.toString("utf8");
}


module.exports = { getUserRole, encrypt, decrypt, areCompromisedPassword };