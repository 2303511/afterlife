const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();

// TODO: import all routes here
const usersRoute = require("./routes/users");

app.use(cors());
app.use(express.json());

// TODO: Define routes
app.use("/api/users", usersRoute); // 🆕 Route added

app.get("/api", (req, res) => {
	console.log("API is working!");
	res.send("API is working!");
});

const port = 8888;
app.listen(port, () => {
	console.log(`Server running on http://localhost:${port}`);
});
