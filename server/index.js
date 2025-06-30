const express = require("express");
const cors = require("cors");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);
require("dotenv").config();

// to log api calls
const morgan = require('morgan');

const app = express();

// Session Store (MYSQL)
const sessionStore = new MySQLStore({
    host:     process.env.DB_HOST,
    user:     process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

// TODO: import all routes here
const usersRoute = require("./routes/user");
const bookingsRoute = require("./routes/booking");
const paymentsRoute = require("./routes/payment");
const nicheRoute = require("./routes/niche");
const beneficiaryRoute = require("./routes/beneficiary");
const blockRoute = require("./routes/block");
const dashboardRoute = require("./routes/dashboard");
const stripeRoute = require("./routes/stripe");
const emailRoutes = require('./routes/email');


app.use(
    cors({ 
        credentials: true 
    }));

app.use(express.json());

// for console.logging api calls
morgan.token("clean-url", (req) => req.baseUrl + req.path);
app.use(morgan("[:date] :method :clean-url :status :response-time ms - :res[content-length]"));
// app.use(morgan('dev')); // logs concise colored output

app.use(
    session({
        name: "sid",  // cookie name
        secret: process.env.SESS_SECRET,
        store: sessionStore,
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            maxAge: 1000 * 60 * 60 * 2,  // 2 hr
        },
    })
);

// TODO: Define routes
app.use("/api/user", usersRoute);
app.use("/api/booking", bookingsRoute); 
app.use("/api/payment", paymentsRoute.router); 
app.use("/api/niche", nicheRoute); 
app.use("/api/beneficiary", beneficiaryRoute);
app.use("/api/block", blockRoute);
app.use("/api/dashboard", dashboardRoute);
app.use("/api/payment", stripeRoute);
app.use('/api/email', emailRoutes.router);

const port = 8888;
app.listen(port, () => {
	console.log(`Server running on http://localhost:${port}`);
});
