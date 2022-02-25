// formats to log into console & response

function addLog(data) {
	// logFormat: date timestamp - [callerName]: <data>
	console.log(
		"\x1b[33m%s\x1b[0m",
		new Date(),
		" -  [" + "\x1b[36m" + addLog.caller?.name + "\x1b[0m" + "]: " + data
	);
}

function calculateStakePercentage(stake, votingPower) {
	return (stake / votingPower) * 100;
}
const formatCast = (cast) => {
	const { id, supports, stake, vote } = cast;
	const stakePercentage =
		calculateStakePercentage(stake, vote.votingPower) + "%";
	return { id, supports, stake: stakePercentage };
};
const formatVote = (vote) => {
	return { id: vote.id, result: getVoteResult(vote) ? "Passed" : "Rejected" };
};

function validateTimeout(startDate) {
	const configuredTimeoutSeconds =
		process.env.CRITERIA_VOTE_TIMEOUT_DAYS * 86400 +
		process.env.CRITERIA_VOTE_TIMEOUT_HOURS * 3600 +
		process.env.CRITERIA_VOTE_TIMEOUT_MINUTES * 60;
	const configuredTimeout = parseInt(startDate) + configuredTimeoutSeconds; // unix timestamp
	if (parseInt((new Date().getTime() / 1000).toFixed(0)) >= configuredTimeout)
		return true;
	return false;
}
const isVoteExecuted = (vote) => {
	// executed || timeout
	if (vote.executed) return true; // executed already
	if (validateTimeout(vote.startDate)) return true; // voting period ends
	return false;
};

function validateMinApproval(vote) {
	const { yea, votingPower, minAcceptQuorum } = vote;
	const minApprovalAchieved =
		(parseInt(yea) / parseInt(votingPower)) * 100 * 1e16;
	return minApprovalAchieved > minAcceptQuorum;
}
function validateSupport(vote) {
	const { yea, nay, supportRequiredPct } = vote;
	const supportAchieved =
		(parseInt(yea) / (parseInt(yea) + parseInt(nay))) * 100 * 1e16;
	return supportAchieved > supportRequiredPct;
}
const getVoteResult = (vote) => {
	return validateSupport(vote) && validateMinApproval(vote);
};

module.exports.addLog = addLog;
module.exports.formatCast = formatCast;
module.exports.formatVote = formatVote;
module.exports.isVoteExecuted = isVoteExecuted;
module.exports.getVoteResult = getVoteResult;
