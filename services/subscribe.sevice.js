const {
	addLog,
	isVoteExecuted,
	formatCast,
	formatVote,
} = require("../helpers");
const {
	getVotingInstance,
	getTokensInstance,
	handlerUnsubscribe,
} = require("./dao.service");
const { getOrg, getAppByName, getTokenHolders } = require("./trackApp.service");

var tokenHoldersCount = 0; // cache

/**
 * Creates subscription to apps updates
 *
 **/
const initAppsTracker = async () => {
	addLog("============Apps Tracker initiated============");
	const org = await getOrg();
	org.onApps(null, (error, app) => {
		addLog("Apps updated: " + app);
	});
};

/**
 * Callback function for vote updates. initialize Casts tracker for each updated vote.
 * This function will be called periodically with updated votes array
 * Takes error, updatedVotes( to log ), prevVotesCount( to verify updated votes info ) as params.
 * Returns prevVotesCount;
 * @param {object} error
 * @param {Array} votes
 * @param {number} prevVotesCount
 *
 * @returns {number}
 **/
function callBackForVotes(error, votes, prevVotesCount) {
	// console.log("checking for votes updates...");
	if (prevVotesCount == 0 && votes.length > 0) {
		addLog("Total Votes:" + votes.length);
		votes.forEach((vote) => {
			initCastsTrackerForVote(vote);
		});
	} else if (prevVotesCount < votes.length) {
		addLog("votes updated, Total votes: " + votes.length);
		for (let index = prevVotesCount; index < votes.length; index++) {
			initCastsTrackerForVote(votes[index]);
		}
	}
	prevVotesCount = votes.length;
	return prevVotesCount;
}
/**
 * Creates subscription to votes updates from voting app
 *
 **/
const initVotesTracker = async () => {
	addLog("============Votes Tracker initiated============");
	const votingApp = await getAppByName("voting");
	const voting = await getVotingInstance(votingApp);
	let prevVotesCount = 0;
	if (tokenHoldersCount == 0) {
		const holders = await getTokenHolders();
		tokenHoldersCount = holders.length; // update count
	}
	initTokenHoldersTracker();
	voting.onVotes({}, (error, votes) => {
		prevVotesCount = callBackForVotes(error, votes, prevVotesCount);
	});
};

/**
 * Callback function for casts updates for a vote. Log for any casts update.
 * This function will be called periodically with updated casts array
 * Takes error, updatedCasts( to log ), voteId( to Log ), prevCasts( to verify updated casts info ) as params.
 * Returns prevCasts;
 * @param {object} error
 * @param {Array} casts
 * @param {string} voteId
 * @param {object} prevCasts
 *
 * @returns {object}
 **/
function callBackForCasts(error, casts, voteId, prevCasts) {
	// console.log("checking for casts of vote(" + voteId + ") updates...");
	const castsArr = casts.map((cast) => formatCast(cast));
	if (JSON.stringify(prevCasts) != JSON.stringify(castsArr)) {
		console.log("\n\n===============================");
		addLog("Total Casts for vote(" + voteId + "):" + casts?.length);
		if (casts?.length) {
			casts.forEach((cast) => {
				addLog(JSON.stringify(formatCast(cast)));
			});
		}
		console.log("===============================");
	}
	prevCasts = castsArr;
	return prevCasts;
}
/**
 * Creates subscription to casts updates for a vote from voting app.
 * Log if votes executed and its status. And unsubscibe tracker if vote is executed.
 * Takes vote as input.
 * @param {object} vote
 *
 **/
const initCastsTrackerForVote = async (vote) => {
	addLog(
		"============Casts Tracker initiated for vote: " +
			vote.id +
			" ============"
	);
	let prevCasts = [];
	const castsHandler = vote.onCasts({}, (error, casts) => {
		if (!casts) casts = [];
		prevCasts = callBackForCasts(error, casts, vote.id, prevCasts);
		if (casts.length) {
			vote = casts[casts.length - 1].vote; // updated vote
		}
		if (
			vote.votingPower == vote.yea + vote.nay ||
			casts.length == tokenHoldersCount
		) {
			// all tokens voted
			addLog("100% tokens voted for " + vote.id);
		}
		if (isVoteExecuted(vote)) {
			const formattedVote = formatVote(vote);
			addLog("Vote Executed: " + JSON.stringify(formattedVote));
			addLog(
				(formattedVote.result == "Passed" ? "\x1b[32m" : "\x1b[31m") +
					formattedVote.result +
					"\x1b[0m"
			);
			console.log("Unsubscribing casts updates of vote(" + vote.id + ")...\n\n");
			handlerUnsubscribe(castsHandler); // unsubscribe after execution
		}
	});
};

/**
 * Creates subscription to token-holders updates from tokens app
 * This callback function will be called periodically with updated tokenHolders array
 *
 **/
const initTokenHoldersTracker = async () => {
	addLog("============Tokens Tracker initiated============");
	const tokensApp = await getAppByName("token-manager");
	const tokens = await getTokensInstance(tokensApp);
	tokens.onHolders({}, (error, tokenHolders) => {
		// console.log("checking for token holders updates...");
		if (tokenHoldersCount != tokenHolders.length)
			addLog("TokenHolders updated: " + tokenHolders.length);
		tokenHoldersCount = tokenHolders.length;
	});
};

module.exports.initAppsTracker = initAppsTracker;

module.exports.initVotesTracker = initVotesTracker;
module.exports.initCastsTrackerForVote = initCastsTrackerForVote;

module.exports.initTokenHoldersTracker = initTokenHoldersTracker;
