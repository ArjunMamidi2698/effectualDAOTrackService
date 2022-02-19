const { connect, describeScript } = require("@aragon/connect");
const { Voting } = require("@aragon/connect-thegraph-voting");
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

const connectToOrg = async () => {
	return await connect(DAO_ADDRESS, "thegraph", { network: 4 });
};
const getVotingInstance = (votingAppAddress, verbose) => {
	return new Voting(votingAppAddress, VOTING_SUBGRAPH_URL, verbose || false);
};

module.exports.EMPTY_SCRIPT = EMPTY_SCRIPT;
module.exports.connectToOrg = connectToOrg;
module.exports.getVotingInstance = getVotingInstance;
module.exports.describeScript = describeScript;
