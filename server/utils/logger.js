const fs = require("fs");
const os = require("os");
const path = require("path");

const logsDir = path.join(__dirname, "../logs");
const logFilePath = path.join(logsDir, "login.logs");

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

module.exports = {
	logLoginAttempt,
};
