const { addLog, isVoteExecuted, formatCast } = require("../helpers");
const {
	connectToOrg,
	getVotingInstance,
	describeScript,
	EMPTY_SCRIPT,
	getTokensInstance,
} = require("./dao.service");
const CircularJSON = require("circular-json");

var org = null; // cache
// DAO
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

// APPS in organisation
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

// Tokens app
const getToken = async () => {
	const tokensApp = await getAppByName("token-manager");
	const tokens = await getTokensInstance(tokensApp);
	const token = await tokens.token();
	addLog("Token: " + JSON.stringify(token));
	return token;
};
const getTokenHolders = async () => {
	const tokensApp = await getAppByName("token-manager");
	const tokens = await getTokensInstance(tokensApp);
	const holders = await tokens.holders();
	addLog("TokenHolders: " + JSON.stringify(holders));
	return holders;
};

// Voting app
const getVotes = async () => {
	const votingApp = await getAppByName("voting");
	const voting = await getVotingInstance(votingApp);
	const votes = await voting.votes();
	addLog("Fetched votes: " + votes.length);
	// const castsArr = await getCastsForAllVotes(votes);
	// console.log(JSON.parse(CircularJSON.stringify(castsArr)));
	return votes;
};
const getCastsForAllVotes = async (votes) => {
	return await Promise.all(
		votes.map(async (vote) => {
			return await getCastsForVote(vote);
		})
	);
};
const getCastsForVote = async (vote) => {
	const casts = await vote.casts();
	addLog("Fetched casts info for vote( " + vote.id + "): " + casts.length);
	addLog(JSON.stringify(casts));
	return casts;
};
const processVote = async (vote) => {
	const casts = await getCastsForVote( vote );
	const castsArr = casts.map( cast => formatCast( cast ));
	return {...vote, castsArr};
};

module.exports.getOrg = getOrg;

module.exports.getApps = getApps;
module.exports.getAppByName = getAppByName;
module.exports.getAppsByAddress = getAppsByAddress;

module.exports.getToken = getToken;
module.exports.getTokenHolders = getTokenHolders;

module.exports.getVotes = getVotes;
module.exports.processVote = processVote;
