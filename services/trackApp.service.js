const {
	connectToOrg,
	getVotingInstance,
	describeScript,
	EMPTY_SCRIPT,
} = require("./dao.service");

let org = null; // cache
const getOrg = async () => {
	if (org == null) org = await connectToOrg();
	return org;
};
const getApps = async () => {
	const org = await getOrg();
	const apps = await org.apps();
	return apps;
};
const getAppsByName = async (name) => {
	const org = await getOrg();
	const app = await org.app(name);
	return app;
};
const getAppsByAddress = async (address) => {
	const org = await getOrg();
	const app = await org.app(address);
	return app;
};
const getVotingAddress = async () => {
	const org = await getOrg();
	const { address: votingAppAddress } = await org.app("voting");
	return votingAppAddress;
};
const getVotes = async () => {
	const votingAppAddress = await getVotingAddress();
	const voting = getVotingInstance(votingAppAddress, true);
	const votes = await voting.votes();
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

module.exports.getOrg = getOrg;
module.exports.getApps = getApps;
module.exports.getAppsByName = getAppsByName;
module.exports.getAppsByAddress = getAppsByAddress;
module.exports.getVotingAddress = getVotingAddress;
module.exports.getVotes = getVotes;
module.exports.processVote = processVote;