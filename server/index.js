require("dotenv").config();

const express      = require("express");
const helmet       = require("helmet");            // secure headers (HSTS, CSP, etc.)
const cors         = require("cors");              // CORS config
const cookieParser = require("cookie-parser");     // parse cookies if you need them elsewhere
const morgan       = require("morgan");            // HTTP request logging

const { sessionMiddleware } = require("./utils/sessionConfig");

// TODO: import all routes here
const usersRoute       = require("./routes/user");
const bookingsRoute    = require("./routes/booking");
const paymentsRoute    = require("./routes/payment");
const nicheRoute       = require("./routes/niche");
const beneficiaryRoute = require("./routes/beneficiary");
const blockRoute       = require("./routes/block");
const dashboardRoute   = require("./routes/dashboard");
const stripeRoute      = require("./routes/stripe");
const emailRoutes      = require('./routes/email');
const authRoutes       = require("./routes/auth");

const app = express();

app.use(helmet());

app.use(cors({
  origin:      process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));

// Disable client-side caching, so /api/user/me always returns JSON
app.use((req, res, next) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
  res.set("Surrogate-Control", "no-store");
  next();
});


app.use(express.json());
app.use(cookieParser());

// for console.logging api calls
morgan.token("clean-url", (req) => req.baseUrl + req.path);
app.use(morgan("[:date] :method :clean-url :status :response-time ms - :res[content-length]"));
// app.use(morgan('dev')); // logs concise colored output

app.use(sessionMiddleware);
app.set('trust proxy', 1);

// TODO: Define routes
app.use("/api/user",        usersRoute);
app.use("/api/booking",     bookingsRoute); 
app.use("/api/payment",     paymentsRoute); 
app.use("/api/niche",       nicheRoute); 
app.use("/api/beneficiary", beneficiaryRoute);
app.use("/api/block",       blockRoute);
app.use("/api/dashboard",   dashboardRoute);
app.use("/api/payment",     stripeRoute);
app.use('/api/email',       emailRoutes);
app.use("/api/auth",        authRoutes);

const port = 8888;
app.listen(port, () => {
	console.log(`Server running on http://localhost:${port}`);
});
