const express = require("express"); // Importing express module
const app = express(); // new express app
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");
const server = require("http").createServer(app);
require("dotenv").config({ path: "./.env" });

const CircularJSON = require("circular-json");
const {
	getOrg,
	getAppByName,
	getAppsByAddress,
	getApps,
	getVotes,
	processVote,
	getToken,
	getTokenHolders,
} = require("./services/trackApp.service");
const { addLog } = require("./helpers");
const {
	initVotesTracker,
	initAppsTracker,
	initTokenHoldersTracker,
} = require("./services/subscribe.sevice");

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
app.use("/*", (req, res, next) => {
	addLog(req.baseUrl);
	next();
});

function handleJSONResponse(res, data) {
	res.setHeader("Content-Type", "application/json");
	app.set("json spaces", 4);
	res.json(data);
}
app.get("/", async (req, res) => {
	const org = await getOrg();
	handleJSONResponse(res, JSON.parse(CircularJSON.stringify(org)));
});
app.get("/apps", async (req, res) => {
	let apps = [];
	var name = req.query["name"];
	var address = req.query["address"];
	if (name && name.trim() != "") apps = await getAppByName(name);
	else if (address && address.trim() != "")
		apps = await getAppsByAddress(address);
	else apps = await getApps();
	handleJSONResponse(res, JSON.parse(CircularJSON.stringify(apps)));
});
app.get("/votes", async (req, res) => {
	const votes = await getVotes();
	const processedVotes = await Promise.all(
		votes.map(async (vote) => processVote(vote))
	);
	processedVotes.reverse();
	handleJSONResponse(res, processedVotes);
});
app.get("/token", async (req, res) => {
	const token = await getToken();
	handleJSONResponse(res, JSON.parse(CircularJSON.stringify(token)));
});
app.get("/token-holders", async (req, res) => {
	const tokenHolders = await getTokenHolders();
	handleJSONResponse(res, JSON.parse(CircularJSON.stringify(tokenHolders)));
});

// Server listening
server.listen(port, () => {
	console.log(`listening at ${port} port!!!!`);
});

// initAppsTracker();
initVotesTracker();
// initTokenHoldersTracker();
