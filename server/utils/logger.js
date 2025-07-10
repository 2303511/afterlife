const fs = require("fs");
const os = require("os");
const path = require("path");

const logsDir = path.join(__dirname, "../logs");

//logs to different file paths
function loggingFunction({ traceId, email, status, req, role }, loggingFileName) {
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
		emailOrId: email,
		status,
		role
	};

	const logLine = JSON.stringify(logEntry) + os.EOL;

	fs.appendFile(loggingFileName, logLine, (err) => {
		if (err){
			console.error("Failed to write login log:", err);
		} else {
			console.log("Log to file successful");
		}
	});
}

module.exports = {
	loggingFunction
};

