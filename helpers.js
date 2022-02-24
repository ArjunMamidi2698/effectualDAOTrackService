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
const formatVote = (vote) => {
	return { id: vote.id, result: getVoteResult(vote) ? "Passed" : "Rejected" };
};
const formatCast = (cast) => {
	const { id, supports, stake, vote } = cast;
	const stakePercentage =
		calculateStakePercentage(stake, vote.votingPower) + "%";
	return { id, supports, stake: stakePercentage };
};

function validateTimeout(startDate) {
	const configuredTimeoutMilSeconds =
		process.env.CRITERIA_VOTE_TIMEOUT_DAYS * 86400000 +
		process.env.CRITERIA_VOTE_TIMEOUT_HOURS * 3600000 +
		process.env.CRITERIA_VOTE_TIMEOUT_MINUTES * 60000;
	const configuredTimeout = parseInt(startDate) + configuredTimeoutMilSeconds;
	if (new Date().getTime() >= configuredTimeout) return true;
	return false;
}
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
const isVoteExecuted = (vote) => {
	// executed || timeout
	if (vote.executed) return true; // executed already
	if (validateTimeout(vote.startDate)) return true; // voting period ends
	return false;
};
module.exports.addLog = addLog;
module.exports.isVoteExecuted = isVoteExecuted;
module.exports.formatCast = formatCast;
module.exports.getVoteResult = getVoteResult;
module.exports.formatVote = formatVote;
