const { connect, describeScript } = require("@aragon/connect");
const connectVoting = require("@aragon/connect-voting");
const connectTokens = require("@aragon/connect-tokens");

const DAO_ADDRESS = process.env.DAO_ADDRESS || "effectual.aragonid.eth"; // The desiredDAO Address.

let NETWORK_ID = process.env.NETWORK_ID || 4; // considering rinkeby testnet as default if not provided in .env
if (NETWORK_ID && !isNaN(NETWORK_ID)) NETWORK_ID = parseInt(NETWORK_ID);

/**
 * create new connection to DAO and returns it's instance.
 * DAO_ADDRESS as param taken from env, and connector as "thegraph" and network info if not connecting to mainnet.
 *
 * @returns {object}
 **/
const connectToOrg = async () => {
	return await connect(DAO_ADDRESS, "thegraph", { network: NETWORK_ID });
};

/**
 * create new tokens app instance with tokensApp object as param and "thegraph" as connector.
 * @param {object} tokensApp
 *
 * @returns {object}
 **/
const getTokensInstance = async (tokensApp) => {
	const tokensInstance = await connectTokens.default(tokensApp, "thegraph");
	return tokensInstance;
};

/**
 * create new voting app instance with votingApp object as param and "thegraph" as connector.
 * @param {object} votingApp
 *
 * @returns {object}
 **/
const getVotingInstance = async (votingApp) => {
	const votingInstance = await connectVoting.default(votingApp, "thegraph");
	return votingInstance;
};

/**
 * Unsubscribe to any updates like app, tokens, votes, casts.
 * Takes handler to unsubscribe as input
 * @param {object} handler
 *
 **/
const handlerUnsubscribe = (handler) => {
	handler.unsubscribe();
};

module.exports.connectToOrg = connectToOrg;
module.exports.getVotingInstance = getVotingInstance;
module.exports.describeScript = describeScript;
module.exports.handlerUnsubscribe = handlerUnsubscribe;
module.exports.getTokensInstance = getTokensInstance;
