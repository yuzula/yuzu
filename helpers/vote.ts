import { Vote } from '../types/vote'

interface GetResultingVoteParams {
  oldVote?: Vote
  vote: Vote
}

export const getResultingVote = ({ oldVote, vote }: GetResultingVoteParams) => {
  if (!oldVote) {
    return { newVote: vote, delta: vote === 'upvote' ? 1 : -1 }
  }

  if (
    (oldVote === 'upvote' && vote === 'upvote') ||
    (oldVote === 'downvote' && vote === 'downvote')
  ) {
    return { newVote: undefined, delta: vote === 'upvote' ? -1 : 1 }
  }

  return { newVote: vote, delta: vote === 'upvote' ? 2 : -2 }
}
