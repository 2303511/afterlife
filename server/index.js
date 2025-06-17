const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();

// TODO: import all routes here
const usersRoute = require("./routes/user");
const bookingsRoute = require("./routes/booking");
const paymentsRoute = require("./routes/payment");
const nicheRoute = require("./routes/niche");
const beneficiaryRoute = require("./routes/beneficiary");
const blockRoute = require("./routes/block");
const dashboardRoute = require("./routes/dashboard");

app.use(cors());
app.use(express.json());

// TODO: Define routes
app.use("/api/user", usersRoute);
app.use("/api/booking", bookingsRoute); 
app.use("/api/payment", paymentsRoute); 
app.use("/api/niche", nicheRoute); 
app.use("/api/beneficiary", beneficiaryRoute);
app.use("/api/block", blockRoute);
app.use("/api/dashboard", dashboardRoute);

app.get("/api", (req, res) => {
	console.log("API is working!");
	res.send("API is working!");
});

app.post("/api/login", (req, res) => {
    console.log("Login route hit");

    const userDetails = req.body;
    console.log("User details:", userDetails);

    // TODO: Implement login logic here

    res.send("Login route is working!");
});

const port = 8888;
app.listen(port, () => {
	console.log(`Server running on http://localhost:${port}`);
});
