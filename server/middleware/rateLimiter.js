const rateLimit = require("express-rate-limit");
const { v4: uuidv4 } = require("uuid");
const { loggingFunction } = require("../utils/logger"); // logging function

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
		loggingFunction({
			traceId: traceId,
			email: req.body.email,
			status: "F - Login rate limit exceeded",
			req,
			role: "UNKNOWN"
		},
		loginFilePath);
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
		loggingFunction({
			traceId: traceId,
			email: req.body.email,
			status: "F - Register rate limit exceeded limit exceeded",
			req,
			role: "UNKNOWN"
		},
		registerFilePath);
		//maybe return the generic error message and traceid to user
		return res.status(options.statusCode).json(options.message);
	}
});

module.exports = {
	loginLimiter,
	registerLimiter,
};
