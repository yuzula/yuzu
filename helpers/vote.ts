interface GetResultingVoteParams {
  oldVote: 'upvote' | 'downvote' | null
  vote: 'upvote' | 'downvote'
}

export const getResultingVote = ({ oldVote, vote }: GetResultingVoteParams) => {
  if (!oldVote) {
    return { newVote: vote, delta: vote === 'upvote' ? 1 : -1 }
  }

  if (
    (oldVote === 'upvote' && vote === 'upvote') ||
    (oldVote === 'downvote' && vote === 'downvote')
  ) {
    return { newVote: null, delta: vote === 'upvote' ? -1 : 1 }
  }

  return { newVote: vote, delta: vote === 'upvote' ? 2 : -2 }
}
