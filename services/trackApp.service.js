const { addLog, formatCast } = require("../helpers");
const {
	connectToOrg,
	getVotingInstance,
	getTokensInstance,
} = require("./dao.service");
const CircularJSON = require("circular-json");

var org = null; // cache
/**
 * returns DAO information. if available in cache, it will return that cached object else create new connection for the configured DAO address
 *
 * @returns {object}
 **/
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
/**
 * returns Apps information in the organisation
 *
 * @returns {Array}
 **/
const getApps = async () => {
	const org = await getOrg();
	const apps = await org.apps();
	addLog("Fetched apps: " + apps.length);
	return apps;
};
/**
 * returns App information in the organisation filtered by name
 * @param {string} name
 *
 * @returns {object}
 **/
const getAppByName = async (name) => {
	try{
		const org = await getOrg();
		const app = await org.app(name);
		addLog("Fetched app by name(" + name + "): " + JSON.stringify(app));
		return app;
	}
	catch(err){
		return {error: err.message};
	}
};
/**
 * returns App information in the organisation filtered by app address
 * @param {string} address
 *
 * @returns {object}
 **/
const getAppsByAddress = async (address) => {
	try {
		const org = await getOrg();
		const app = await org.app(address);
		addLog("Fetched app by address(" + address + "): " + JSON.stringify(app));
		return app;
	} catch (err) {
		return {error: err.message};		
	}
};
/**
 * returns App address in the organisation filtered by app name
 * @param {string} name
 *
 * @returns {string}
 **/
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
/**
 * returns Token detials in the organisation from tokens app
 *
 * @returns {object}
 **/
const getToken = async () => {
	const tokensApp = await getAppByName("token-manager");
	const tokens = await getTokensInstance(tokensApp);
	const token = await tokens.token();
	addLog("Token: " + JSON.stringify(token));
	return token;
};
/**
 * returns Token holders info in the organisation from tokens app
 *
 * @returns {Array}
 **/
const getTokenHolders = async () => {
	const tokensApp = await getAppByName("token-manager");
	const tokens = await getTokensInstance(tokensApp);
	const holders = await tokens.holders();
	addLog("TokenHolders: " + JSON.stringify(holders));
	return holders;
};

// Voting app
/**
 * returns all votes info in the organisation from voting app
 *
 * @returns {Array}
 **/
const getVotes = async () => {
	const votingApp = await getAppByName("voting");
	const voting = await getVotingInstance(votingApp);
	const votes = await voting.votes();
	addLog("Fetched votes: " + votes.length);
	// const castsArr = await getCastsForAllVotes(votes);
	// console.log(JSON.parse(CircularJSON.stringify(castsArr)));
	return votes;
};
/**
 * returns all casts info for all votes given as param in the organisation from voting app. Takes votes as param.
 * @param {Array} votes
 *
 * @returns {Array}
 **/
const getCastsForAllVotes = async (votes) => {
	return await Promise.all(
		votes.map(async (vote) => {
			return await getCastsForVote(vote);
		})
	);
};
/**
 * returns all casts info for a vote given as param in the organisation from voting app. Takes vote as param.
 * @param {object} vote
 *
 * @returns {Array}
 **/
const getCastsForVote = async (vote) => {
	const casts = await vote.casts();
	addLog("Fetched casts info for vote( " + vote.id + "): " + casts.length);
	addLog(JSON.stringify(casts));
	return casts;
};
/**
 * returns vote info with casts info included in the object for a vote passed as param.
 * @param {object} vote
 *
 * @returns {object}
 **/
const processVote = async (vote) => {
	const casts = await getCastsForVote(vote);
	const castsArr = casts.map((cast) => formatCast(cast));
	return { ...vote, casts: castsArr };
};

module.exports.getOrg = getOrg;

module.exports.getApps = getApps;
module.exports.getAppByName = getAppByName;
module.exports.getAppsByAddress = getAppsByAddress;

module.exports.getToken = getToken;
module.exports.getTokenHolders = getTokenHolders;

module.exports.getVotes = getVotes;
module.exports.processVote = processVote;
