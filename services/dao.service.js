const { connect, describeScript } = require("@aragon/connect");
const { Voting } = require("@aragon/connect-thegraph-voting"); // AJ - TODO - @aragon/connect-voting
const { TokenManager } = require("@aragon/connect-thegraph-token-manager");
require("dotenv").config({ path: "../.env" });

// Empty script; votes that do not execute any actions will contain this.
const EMPTY_SCRIPT = "0x00000001";
// The desiredDAO Address.
const DAO_ADDRESS = process.env.DAO_ADDRESS || "effectual.aragonid.eth";
// const DAO_ADDRESS = "example3.aragonid.eth";
// The URL of the corresponding subgraph.
const VOTING_SUBGRAPH_URL =
	process.env.VOTING_SUBGRAPH_URL ||
	"https://api.thegraph.com/subgraphs/name/aragon/aragon-voting-rinkeby";
const TOKEN_MANAGER_SUBGRAPH_URL =
	process.env.TOKEN_MANAGER_SUBGRAPH_URL ||
	"https://api.thegraph.com/subgraphs/name/aragon/aragon-tokens-rinkeby";

const connectToOrg = async () => {
	return await connect(DAO_ADDRESS, "thegraph", { network: process.env.NETWORK_ID || 4 });
};
const getTokenManagerInstance = (TOKENS_APP_ADDRESS, verbose) => {
	return new TokenManager(
		TOKENS_APP_ADDRESS,
		TOKEN_MANAGER_SUBGRAPH_URL,
		verbose || false
	);
};
const getVotingInstance = (votingAppAddress, verbose) => {
	return new Voting(votingAppAddress, VOTING_SUBGRAPH_URL, verbose || false);
};
const getAppsHandler = async (org) => {
	if (org == null) org = await connectToOrg();
	return org.onApps();
};
const getVotesHandler = async (org) => {
	if (org == null) org = await connectToOrg();
	const { address: votingAppAddress } = await org.app("voting");
	const voting = getVotingInstance(votingAppAddress, true);
	return voting.onVotes();
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
module.exports.getTokenManagerInstance = getTokenManagerInstance;
