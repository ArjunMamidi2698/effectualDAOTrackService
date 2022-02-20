const { connect, describeScript } = require("@aragon/connect");
const connectVoting = require("@aragon/connect-voting");
const connectTokens = require("@aragon/connect-tokens");

const EMPTY_SCRIPT = "0x00000001"; // Empty script; votes that do not execute any actions will contain this.
const DAO_ADDRESS = process.env.DAO_ADDRESS || "effectual.aragonid.eth"; // The desiredDAO Address.

let NETWORK_ID = process.env.NETWORK_ID || 4; // considering rinkeby testnet as default if not provided in .env
if (NETWORK_ID && !isNaN(NETWORK_ID)) NETWORK_ID = parseInt(NETWORK_ID);

const connectToOrg = async () => {
	return await connect(DAO_ADDRESS, "thegraph", { network: NETWORK_ID });
};
const getTokensInstance = async (tokensApp) => {
	const tokensInstance = await connectTokens.default(tokensApp, "thegraph");
	return tokensInstance;
};
const getVotingInstance = async (votingApp) => {
	const votingInstance = await connectVoting.default(votingApp, "thegraph");
	return votingInstance;
};
const getAppsHandler = async (org) => {
	if (org == null) org = await connectToOrg();
	return org.onApps();
};
const getVotesHandler = async (org, callBackForVotes) => {
	if (org == null) org = await connectToOrg();
	const { address: votingAppAddress } = await org.app("voting");
	const voting = getVotingInstance(votingAppAddress, false);
	return voting.onVotes(callBackForVotes);
};
const handlerUnsubscribe = (handler) => {
	handler.unsubscribe();
};
module.exports.EMPTY_SCRIPT = EMPTY_SCRIPT;
module.exports.connectToOrg = connectToOrg;
module.exports.getVotingInstance = getVotingInstance;
module.exports.describeScript = describeScript;
module.exports.getAppsHandler = getAppsHandler;
module.exports.getVotesHandler = getVotesHandler;
module.exports.handlerUnsubscribe = handlerUnsubscribe;
module.exports.getTokensInstance = getTokensInstance;
