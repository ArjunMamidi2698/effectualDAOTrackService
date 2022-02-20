const { addLog } = require("../helpers");
const {
	connectToOrg,
	getVotingInstance,
	describeScript,
	EMPTY_SCRIPT,
	getAppsHandler,
	getVotesHandler,
	handlerUnsubscribe,
	getTokensInstance,
} = require("./dao.service");
const CircularJSON = require("circular-json");

let org = null; // cache
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
	const votingApp = await getAppByName("voting");
	const voting = await getVotingInstance(votingApp);
	const votes = await voting.votes();
	addLog("Fetched votes: " + votes.length);
	const castsArr = await Promise.all(
		votes.map(async (vote) => {
			return await vote.casts();
		})
	);
	console.log( JSON.parse(CircularJSON.stringify(castsArr)) );
	return votes;
};
const getCastsForVote = async ( vote ) => {
	const casts = await vote.casts();
	console.log( vote.id );
	console.log( casts );
	return casts;
};
const processVote = async (vote) => {
	// if (vote.script === EMPTY_SCRIPT) return vote;
	// const apps = await getApps();
	// try {
	// 	const transaction = await describeScript(vote.script, apps, "theGraph");
	// 	// console.log(transaction);
	// 	const [{ description }] = transaction;
	// 	// console.log(description, "hhhhhhhhhhhhhhhhhhhhhhhhh");
	// 	addLog("Added metadata for id( " + vote.id + " ): " + description);
	// 	return { ...vote, metadata: description };
	// } catch (error) {
	// 	// console.log(error.message);
	// 	return vote;
	// }
	return vote;
};
const initAppsTracker = async () => {
	const org = await getOrg();
	getAppsHandler(org).then((apps) => {
		console.log(apps);
		addLog("Apps updated: " + apps.length);
	});
};
function callBackForVotes(error, votes) {
	console.log(error, votes);
	console.log("data in callback");
}
// const initCastingVotesTracker = async (vote:Vote) => {

// };
const initVotesTracker = async () => {
	const org = await getOrg();
	getVotesHandler(org, callBackForVotes);
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
