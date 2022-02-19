const { addLog } = require("../helpers");
const {
	connectToOrg,
	getVotingInstance,
	describeScript,
	EMPTY_SCRIPT,
	getAppsHandler,
	getVotesHandler,
	handlerUnsubscribe,
	getTokenManagerInstance,
} = require("./dao.service");

let org = null; // cache
let token = null; // cache
const getOrg = async () => {
	if (org == null) {
		org = await connectToOrg();
		addLog(
			"New Conenction to the Org: " +
				(org.connection?.orgLocation
					? org.connection.orgLocation
					: org.connection.orgAddress)
		);
	} else {
		addLog(
			"Fetching Org from cache: " +
				(org.connection?.orgLocation
					? org.connection.orgLocation
					: org.connection.orgAddress)
		);
	}
	return org;
};
const getToken = async () => {
	if (token != null) return token;
	const tokensAppAddress = await getAppAddress("token-manager");
	const tokenManager = getTokenManagerInstance(tokensAppAddress, true);
	token = await tokenManager.token();
	token._connector = tokenManager._connector;
	addLog("Token: " + JSON.stringify(token));
	return token;
};
const getTokenHolders = async () => {
	if (token != null) token = await getToken();
	const holders = await token.holders();
	addLog("TokenHolders: " + JSON.stringify(holders));
	return holders;
};
const getApps = async () => {
	const org = await getOrg();
	const apps = await org.apps();
	addLog("Fetched apps: " + apps.length);
	return apps;
};
const getAppByName = async (name) => {
	const org = await getOrg();
	const app = await org.app(name);
	addLog("Fetched app by name(" + name + "): " + JSON.stringify(app));
	return app;
};
const getAppsByAddress = async (address) => {
	const org = await getOrg();
	const app = await org.app(address);
	addLog("Fetched app by address(" + address + "): " + JSON.stringify(app));
	return app;
};
const getAppAddress = async (name) => {
	try {
		const { address: appAddress } = await getAppByName(name);
		addLog("App address for " + name + ": " + appAddress);
		return appAddress;
	} catch (err) {
		return { error: err.message };
	}
};
const getVotes = async () => {
	const votingAppAddress = await getAppAddress("voting");
	const voting = getVotingInstance(votingAppAddress, true);
	const votes = await voting.votes();
	addLog("Fetched votes: " + votes.length);
	return votes;
};
const processVote = async (vote) => {
	if (vote.script === EMPTY_SCRIPT) return vote;
	const apps = await getApps();
	try {
		const [{ description }] = await describeScript(vote.script, apps);
		console.log(description, "hhhhhhhhhhhhhhhhhhhhhhhhh");
		return { ...vote, metadata: description };
	} catch (error) {
		console.log(error);
		return vote;
	}
};
const initAppsTracker = async () => {
	const org = await getOrg();
	getAppsHandler(org).then((apps) => {
		console.log(apps);
		addLog("Apps updated: " + apps.length);
	});
};
const initVotesTracker = async () => {
	const org = await getOrg();
	getVotesHandler(org).then((votes) => {
		console.log(votes);
		addLog("Votes updated: " + votes.length);
	});
};

module.exports.getOrg = getOrg;
module.exports.getApps = getApps;
module.exports.getAppByName = getAppByName;
module.exports.getAppsByAddress = getAppsByAddress;
module.exports.getToken = getToken;
module.exports.getTokenHolders = getTokenHolders;
module.exports.getVotes = getVotes;
module.exports.processVote = processVote;
module.exports.initAppsTracker = initAppsTracker;
module.exports.initVotesTracker = initVotesTracker;
