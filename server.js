const express = require("express"); // Importing express module
const app = express(); // new express app
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");
const server = require("http").createServer(app);
const CircularJSON = require("circular-json");


const port = process.env.SERVER_PORT || process.env.PORT || 2022;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());
app.use(bodyParser.json());
app.use((req, res, next) => {
	res.header("Access-Control-Allow-Origin", "*");
	next();
});

function handleJSONResponse(res, data) {
	res.setHeader("Content-Type", "application/json");
	app.set("json spaces", 4);
	res.json(data);
}

app.get("/", async (req, res) => {
	handleJSONResponse(res, JSON.parse(CircularJSON.stringify({"res": "sample response"})));
});

// Server listening
server.listen(port, () => {
	console.log(`listening at ${port} port!!!!`);
});
