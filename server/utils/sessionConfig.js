const session       = require("express-session");
const MySQLStore    = require("express-mysql-session")(session);

// 1) Create the MySQL-based session store (shared across your app)
const sessionStore = new MySQLStore({
    host:     process.env.DB_HOST,
    user:     process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
});

// 2) Export the session middleware with your security settings
const sessionMiddleware = session({
  name:   process.env.SESSION_COOKIE_NAME || "sid", // cookie name
  secret: process.env.SESS_SECRET,                  // signs & verifies cookie
  store:  sessionStore,                             // server-side storage
  resave: false,                                    // don’t save if unmodified
  saveUninitialized: false,                         // no empty sessions
  rolling: true,                                    // reset TTL on each req
  cookie: {
    httpOnly: true,                                 // JS can’t access it (XSS defense)
    secure:   process.env.NODE_ENV === "production",// HTTPS only in prod
    sameSite: "lax",                                // CSRF mitigation
    maxAge:   1000 * 60 * 60 * 2                    // 2-hour idle timeout
  }
});

module.exports = {
  sessionMiddleware,
  sessionStore
};
