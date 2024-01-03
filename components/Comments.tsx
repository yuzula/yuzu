import { useActionSheet } from '@expo/react-native-action-sheet'
import React, {
  FunctionComponent,
  memo,
  ReactNode,
  useCallback,
  useEffect,
  useMemo
} from 'react'
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ListRenderItemInfo,
  Text,
  View
} from 'react-native'

import { GENERIC_ERROR_MESSAGE } from '../constants/alert'
import { getResultingVote } from '../helpers/vote'
import { useAuthenticatedProfile } from '../hooks/useAuthenticatedProfile'
import { useBlockUser } from '../hooks/useBlockUser'
import { useDeleteComment } from '../hooks/useDeleteComment'
import { useReportComment } from '../hooks/useReportComment'
import { useVoteComment } from '../hooks/useVoteComment'
import { commentModel } from '../models/comment'
import { Vote } from '../types/vote'
import { Comment } from './Comment'
import { Separator } from './Separator'

interface CommentsProps {
  comments?: commentModel.Schema[]
  variant?: 'parent' | 'child'
  communityDomainName: string
  isPostPrivate: boolean
  areCommentsFetching: boolean
  hasCommentsNextPage: boolean
  isRefreshing: boolean
  areCommentsFetchingNextPage: boolean
  fetchCommentsNextPage: () => void
  renderListHeader: () => ReactNode
  onRefresh: () => void
  onCommentPress: (id: number) => void
  onCommentReplyButtonPress: (comment: commentModel.Schema) => void
}

export const Comments: FunctionComponent<CommentsProps> = memo(
  ({
    variant,
    comments,
    communityDomainName,
    isPostPrivate,
    areCommentsFetching,
    hasCommentsNextPage,
    isRefreshing,
    areCommentsFetchingNextPage,
    fetchCommentsNextPage,
    renderListHeader,
    onRefresh,
    onCommentPress,
    onCommentReplyButtonPress
  }) => {
    const { showActionSheetWithOptions } = useActionSheet()

    const { profile } = useAuthenticatedProfile()

    const { mutate: voteComment, error: voteCommentError } = useVoteComment()

    const { mutate: deleteComment, error: deleteCommentError } =
      useDeleteComment()

    const { mutate: blockUser, error: blockUserError } = useBlockUser()

    const { mutate: reportComment, error: reportCommentError } =
      useReportComment()

    useEffect(() => {
      if (deleteCommentError) {
        Alert.alert('Could not delete comment', GENERIC_ERROR_MESSAGE)
      }
    }, [deleteCommentError])

    useEffect(() => {
      if (reportCommentError) {
        Alert.alert('Could not report comment', GENERIC_ERROR_MESSAGE)
      }
    }, [reportCommentError])

    useEffect(() => {
      if (blockUserError) {
        Alert.alert('Could not block user', GENERIC_ERROR_MESSAGE)
      }
    }, [blockUserError])

    useEffect(() => {
      if (voteCommentError) {
        Alert.alert('Could not vote on comment', GENERIC_ERROR_MESSAGE)
      }
    }, [voteCommentError])

    const handleBlockAuthorButtonPress = useCallback(
      (authorId: string) => {
        blockUser({ userId: authorId })

        onRefresh()
      },
      [blockUser, onRefresh]
    )

    const handleReportCommentButtonPress = useCallback(
      (comment: commentModel.Schema) => {
        reportComment({ commentId: comment.id })

        Alert.alert('Comment has been reported for moderation', undefined, [
          {
            onPress: () => {
              Alert.alert(
                'Would you like to block the author of the comment?',
                undefined,
                [
                  {
                    text: 'No'
                  },
                  {
                    text: 'Yes',
                    onPress: () => {
                      if (comment.user_id) {
                        handleBlockAuthorButtonPress(comment.user_id)
                      }
                    }
                  }
                ]
              )
            }
          }
        ])
      },
      [handleBlockAuthorButtonPress, reportComment]
    )

    const handleCommentEllipsisButtonPress = useCallback(
      (comment: commentModel.Schema) => {
        if (profile.id === comment.user_id) {
          showActionSheetWithOptions(
            {
              title: 'More actions',
              options: ['Delete this comment', 'Cancel'],
              destructiveButtonIndex: 0,
              cancelButtonIndex: 1
            },
            index => {
              if (index === 1) {
                return
              }

              Alert.alert(
                'Are you sure you want to delete this comment?',
                undefined,
                [
                  {
                    text: 'Yes',
                    style: 'destructive',
                    onPress: () => deleteComment({ commentId: comment.id })
                  },
                  {
                    text: 'Cancel',
                    style: 'cancel'
                  }
                ]
              )
            }
          )
        } else {
          showActionSheetWithOptions(
            {
              title: 'More actions',
              options: ['Report this comment', 'Block the author', 'Cancel'],
              destructiveButtonIndex: 1,
              cancelButtonIndex: 2
            },
            index => {
              if (index === 2) {
                return
              }

              if (index === 0) {
                handleReportCommentButtonPress(comment)
              } else if (index === 1 && comment.user_id) {
                handleBlockAuthorButtonPress(comment.user_id)
              }
            }
          )
        }
      },
      [
        deleteComment,
        handleBlockAuthorButtonPress,
        handleReportCommentButtonPress,
        profile.id,
        showActionSheetWithOptions
      ]
    )

    const handleCommentVoteButtonPress = useCallback(
      ({
        commentId,
        oldVote,
        vote
      }: {
        commentId: number
        oldVote?: Vote
        vote: Vote
      }) => {
        const { newVote, delta } = getResultingVote({ oldVote, vote })

        voteComment({ commentId, vote: newVote, delta })
      },
      [voteComment]
    )

    const handleEndReached = useCallback(() => {
      if (!areCommentsFetching && hasCommentsNextPage) {
        fetchCommentsNextPage()
      }
    }, [areCommentsFetching, fetchCommentsNextPage, hasCommentsNextPage])

    const renderListFooterComponent = useCallback(() => {
      if (areCommentsFetchingNextPage) {
        return <ActivityIndicator className="py-4" />
      }

      return null
    }, [areCommentsFetchingNextPage])

    const renderListItem = useCallback(
      ({ item: comment }: ListRenderItemInfo<commentModel.Schema>) => (
        <Comment
          commentCount={comment.comment_count}
          communityDomainName={communityDomainName}
          content={comment.content}
          createdAt={comment.created_at}
          currentUserVote={comment.current_user_vote}
          id={comment.id}
          isAuthorInternal={comment.is_author_internal}
          isDeleted={comment.is_deleted}
          isFlagged={comment.is_flagged}
          isPostPrivate={isPostPrivate}
          username={comment.username}
          variant={variant}
          voteCount={comment.vote_count}
          onPress={onCommentPress}
          onReplyButtonPress={() => onCommentReplyButtonPress(comment)}
          onDownvoteButtonPress={() =>
            handleCommentVoteButtonPress({
              commentId: comment.id,
              oldVote: comment.current_user_vote,
              vote: 'downvote'
            })
          }
          onEllipsisButtonPress={() =>
            handleCommentEllipsisButtonPress(comment)
          }
          onUpvoteButtonPress={() =>
            handleCommentVoteButtonPress({
              commentId: comment.id,
              oldVote: comment.current_user_vote,
              vote: 'upvote'
            })
          }
        />
      ),
      [
        communityDomainName,
        handleCommentEllipsisButtonPress,
        handleCommentVoteButtonPress,
        isPostPrivate,
        onCommentPress,
        onCommentReplyButtonPress,
        variant
      ]
    )

    const renderListEmptyComponent = useCallback(
      () => (
        <View className="flex-1 items-center justify-center">
          <Text className="font-Poppins_600SemiBold text-base text-gray-light">
            No comments yet
          </Text>
          <Text className="font-Poppins_500Medium text-gray-light">
            Be the first to comment!
          </Text>
        </View>
      ),
      []
    )

    const listKeyExtractor = useCallback(
      (comment: commentModel.Schema) => comment.id.toString(),
      []
    )

    const listContentContainerStyle = useMemo(() => ({ flexGrow: 1 }), [])

    return (
      <FlatList
        ItemSeparatorComponent={Separator}
        ListEmptyComponent={renderListEmptyComponent}
        ListFooterComponent={renderListFooterComponent}
        ListHeaderComponent={renderListHeader}
        className="w-full"
        contentContainerStyle={listContentContainerStyle}
        data={comments}
        keyExtractor={listKeyExtractor}
        keyboardDismissMode="interactive"
        refreshing={isRefreshing}
        renderItem={renderListItem}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.2}
        onRefresh={onRefresh}
      />
    )
  }
)
