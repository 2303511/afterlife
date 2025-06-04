const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();

// TODO: import all routes here
const usersRoute = require("./routes/users");
const bookingsRoute = require("./routes/bookings");
const paymentsRoute = require("./routes/payments");
const nicheRoute = require("./routes/niche");

app.use(cors());
app.use(express.json());

// TODO: Define routes
app.use("/api/users", usersRoute);
app.use("/api/bookings", bookingsRoute); 
app.use("/api/payments", paymentsRoute); 
app.use("/api/niche", nicheRoute); 

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
