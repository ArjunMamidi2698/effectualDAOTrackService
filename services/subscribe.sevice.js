const {
	addLog,
	isVoteExecuted,
	formatCast,
	formatVote,
} = require("../helpers");
const {
	getAppsHandler,
	getVotingInstance,
	getTokensInstance,
	handlerUnsubscribe,
} = require("./dao.service");
const { getOrg, getAppByName, getTokenHolders } = require("./trackApp.service");

var tokenHoldersCount = 0; // cache

// subscribe to Apps updates
const initAppsTracker = async () => {
	addLog("============Apps Tracker initiated============");
	const org = await getOrg();
	getAppsHandler(org).then((apps) => {
		console.log(apps);
		addLog("Apps updated: " + apps.length);
	});
};

// subscribe to Votes updates( Voting app )
function callBackForVotes(error, votes, prevVotesCount) {
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

// subscribe to Casts updates for a Vote
function callBackForCasts(error, casts, voteId) {
	// console.log(error);
	// AJ - TODO - LOG ALL CASTS DETAILS( PROCESS CASTS )
	console.log("\n\n===============================");
	addLog("Total Casts for vote(" + voteId + "):" + casts?.length);
	if (casts?.length) {
		casts.forEach((cast) => {
			addLog(JSON.stringify(formatCast(cast)));
		});
	}
	console.log("===============================");
}
const initCastsTrackerForVote = async (vote) => {
	addLog(
		"============Casts Tracker initiated for vote: " +
			vote.id +
			" ============"
	);
	const castsHandler = vote.onCasts({}, (error, casts) => {
		if (!casts) casts = [];
		callBackForCasts(error, casts, vote.id);
		if (
			vote.votingPower == vote.yea + vote.nay ||
			casts.length == tokenHoldersCount
		) {
			// all tokens voted
			addLog("100% tokens voted for " + vote.id);
		}
		if (isVoteExecuted(vote) || casts.length == 0) {
			addLog(
				"Vote Executed: " + JSON.stringify(formatVote(vote)) + "\n\n"
			);
			handlerUnsubscribe(castsHandler); // unsubscribe after execution
		}
	});
};

// subscribe to TokenHolders updates( Tokens app )
const initTokenHoldersTracker = async () => {
	addLog("============Tokens Tracker initiated============");
	const tokensApp = await getAppByName("token-manager");
	const tokens = await getTokensInstance(tokensApp);
	tokens.onHolders({}, (error, tokenHolders) => {
		if (tokenHoldersCount != tokenHolders.length)
			addLog("TokenHolders updated: " + tokenHolders.length);
		tokenHoldersCount = tokenHolders.length;
	});
};

module.exports.initAppsTracker = initAppsTracker;

module.exports.initVotesTracker = initVotesTracker;
module.exports.initCastsTrackerForVote = initCastsTrackerForVote;

module.exports.initTokenHoldersTracker = initTokenHoldersTracker;
