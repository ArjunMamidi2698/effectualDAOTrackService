// formats to log into console & response

/**
 * addLog takes data as a param and prints into console with its format
 * @param {string} data
 *
 **/
function addLog(data) {
	// logFormat: date timestamp - [callerName]: <data>
	console.log(
		"\x1b[33m%s\x1b[0m",
		new Date(),
		" -  [" + "\x1b[36m" + addLog.caller?.name + "\x1b[0m" + "]: " + data
	);
}

/**
 * calculateStakePercentage takes stake value and votingPower from votes as a params and returns stake percentage
 * @param {number} stake
 * @param {number} votingPower
 *
 * @returns {number}
 **/
function calculateStakePercentage(stake, votingPower) {
	return Math.round((stake / votingPower) * 100);
}
/**
 * returns id, support, stakePercentage info as object for the cast. Takes full object of cast as param;
 * @param {object} cast
 *
 * @returns {object}
 **/
const formatCast = (cast) => {
	const { id, supports, stake, vote } = cast;
	const stakePercentage =
		calculateStakePercentage(stake, vote.votingPower) + "%";
	return { id, supports, stake: stakePercentage };
};

/**
 * returns minApproval criteria matched. Takes full object of vote as param;
 * Min Approval is the percentage of the total token supply that is required to vote “Yes” on a proposal before it can be approved.
 * @param {object} vote
 *
 * @returns {boolean}
 **/
function validateMinApproval(vote) {
	// Min Approval => Overall yes% to total tokens(voted & non-voted)
	const { yea, votingPower, minAcceptQuorum } = vote;
	const minApprovalAchieved =
		(parseInt(yea) / parseInt(votingPower)) * 100 * 1e16;
	return minApprovalAchieved > minAcceptQuorum;
}
/**
 * returns support criteria matched. Takes full object of vote as param;
 * Support is the relative percentage of tokens that are required to vote “Yes” for a proposal to be approved.
 * @param {object} vote
 *
 * @returns {boolean}
 **/
function validateSupport(vote) {
	// Support => Overall yes tokens percentage to no tokens percentage
	const { yea, nay, supportRequiredPct } = vote;
	const supportAchieved =
		(parseInt(yea) / (parseInt(yea) + parseInt(nay))) * 100 * 1e16;
	return supportAchieved > supportRequiredPct;
}
// Result: if criteria Passed => Passed else Rejected
const getVoteResult = (vote) => {
	return validateSupport(vote) && validateMinApproval(vote);
};
/**
 * returns id, result info as object for the vote. Takes full object of vote as param;
 * vote result is calculated by checking support and minApproval criteria
 * @param {object} cast
 *
 * @returns {object}
 **/
const formatVote = (vote) => {
	return { id: vote.id, result: getVoteResult(vote) ? "Passed" : "Rejected" };
};

/**
 * Timeout configured for DAO. 
 * Returns true/false if current unixTime > configured time. Takes startDate as param from the vote object.
 * @param {string} startDate
 *
 * @returns {boolean}
 **/
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
/**
 * Returns true/false if vote executed or configured timeout. Takes full object of vote as param.
 * @param {object} vote
 *
 * @returns {boolean}
 **/
const isVoteExecuted = (vote) => {
	// executed || timeout
	if (vote.executed) return true; // executed already
	if (validateTimeout(vote.startDate)) return true; // voting period ends
	return false;
};


module.exports.addLog = addLog;
module.exports.formatCast = formatCast;
module.exports.formatVote = formatVote;
module.exports.isVoteExecuted = isVoteExecuted;
module.exports.getVoteResult = getVoteResult;
