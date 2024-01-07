import { useActionSheet } from '@expo/react-native-action-sheet'
import { FontAwesome5 } from '@expo/vector-icons'
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState
} from 'react'
import { Alert, Pressable, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as Sentry from 'sentry-expo'

import { Comment as CommentComponent } from '../components/Comment'
import { Comments } from '../components/Comments'
import { CommentSkeleton } from '../components/CommentSkeleton'
import { GENERIC_ERROR_MESSAGE } from '../constants/alert'
import { getResultingVote } from '../helpers/vote'
import { useAuthenticatedProfile } from '../hooks/useAuthenticatedProfile'
import { useBlockUser } from '../hooks/useBlockUser'
import { useChildComments } from '../hooks/useChildComments'
import { useComment } from '../hooks/useComment'
import { useDeleteComment } from '../hooks/useDeleteComment'
import { usePost } from '../hooks/usePost'
import { useReportComment } from '../hooks/useReportComment'
import { useUserRefresh } from '../hooks/useUserRefresh'
import { useVoteComment } from '../hooks/useVoteComment'
import { commentModel } from '../models/comment'
import { RootStackScreenProps } from '../types'
import { Vote } from '../types/vote'

export const Comment: FunctionComponent<RootStackScreenProps<'Comment'>> = ({
  navigation,
  route: {
    params: { postId, commentId }
  }
}) => {
  const [isPostInitialLoading, setIsPostInitialLoading] = useState(true)
  const [areCommentsInitialLoading, setAreCommentsInitialLoading] =
    useState(true)
  const [isCommentInitialLoading, setIsCommentInitialLoading] = useState(true)

  const { showActionSheetWithOptions } = useActionSheet()

  const { profile } = useAuthenticatedProfile()

  const {
    data: post,
    error: postError,
    isFetching: isPostFetching,
    refetch: refetchPost
  } = usePost(postId)

  const {
    data: comment,
    error: commentError,
    isFetching: isCommentFetching,
    refetch: refetchComment
  } = useComment(commentId)

  const {
    data: commentsData,
    error: commentsError,
    isFetching: areCommentsFetching,
    refetch: refetchComments,
    fetchNextPage: fetchCommentsNextPage,
    hasNextPage: hasCommentsNextPage,
    isFetchingNextPage: areCommentsFetchingNextPage
  } = useChildComments({ commentId })

  const { refresh: refreshPost, isRefreshing: isPostRefreshing } =
    useUserRefresh(refetchPost)
  const { refresh: refreshComment, isRefreshing: isCommentRefreshing } =
    useUserRefresh(refetchComment)
  const { refresh: refreshComments, isRefreshing: areCommentsRefreshing } =
    useUserRefresh(refetchComments)

  const { mutate: deleteComment, error: deleteCommentError } =
    useDeleteComment()

  const { mutate: voteComment, error: voteCommentError } = useVoteComment()

  const { mutate: blockUser, error: blockUserError } = useBlockUser()

  const { mutate: reportComment, error: reportCommentError } =
    useReportComment()

  useEffect(() => {
    if (!isPostFetching) {
      setIsPostInitialLoading(false)
    }
  }, [areCommentsFetching, isPostFetching])

  useEffect(() => {
    if (!areCommentsFetching) {
      setAreCommentsInitialLoading(false)
    }
  }, [areCommentsFetching])

  useEffect(() => {
    if (!isCommentFetching) {
      setIsCommentInitialLoading(false)
    }
  }, [areCommentsFetching, isCommentFetching])

  useEffect(() => {
    if (voteCommentError) {
      Alert.alert('Could not vote on comment', GENERIC_ERROR_MESSAGE)
    }
  }, [voteCommentError])

  useEffect(() => {
    if (postError) {
      Sentry.Native.captureException(postError)

      Alert.alert('Could not fetch post', GENERIC_ERROR_MESSAGE)
    }
  }, [postError])

  useEffect(() => {
    if (commentError) {
      Sentry.Native.captureException(commentError)

      Alert.alert('Could not fetch comment', GENERIC_ERROR_MESSAGE)
    }
  }, [commentError])

  useEffect(() => {
    if (commentsError) {
      Sentry.Native.captureException(commentsError)

      Alert.alert('Could not fetch comments', GENERIC_ERROR_MESSAGE)
    }
  }, [commentsError])

  useEffect(() => {
    if (deleteCommentError) {
      Sentry.Native.captureException(deleteCommentError)

      Alert.alert('Could not delete comment', GENERIC_ERROR_MESSAGE)
    }
  }, [deleteCommentError])

  useEffect(() => {
    if (blockUserError) {
      Sentry.Native.captureException(blockUserError)

      Alert.alert('Could not block user', GENERIC_ERROR_MESSAGE)
    }
  }, [blockUserError])

  useEffect(() => {
    if (reportCommentError) {
      Sentry.Native.captureException(reportCommentError)

      Alert.alert('Could not report comment', GENERIC_ERROR_MESSAGE)
    }
  }, [reportCommentError])

  const handleBackButtonPress = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack()
    } else {
      navigation.navigate('Post', { postId })
    }
  }, [navigation, postId])

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
                      blockUser({ userId: comment.user_id })
                    }
                  }
                }
              ]
            )
          }
        }
      ])
    },
    [blockUser, reportComment]
  )

  const handleCommentEllipsisButtonPress = useCallback(() => {
    if (!comment) {
      return Alert.alert('Could not get comment details', GENERIC_ERROR_MESSAGE)
    }

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
                onPress: () => {
                  deleteComment({ commentId })
                }
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
            blockUser({ userId: comment.user_id })
          }
        }
      )
    }
  }, [
    blockUser,
    comment,
    commentId,
    deleteComment,
    handleReportCommentButtonPress,
    profile.id,
    showActionSheetWithOptions
  ])

  const handleHeaderReplyButtonPress = useCallback(() => {
    if (!post) {
      Sentry.Native.captureException('Post is not defined')

      return Alert.alert('Could not reply to comment', GENERIC_ERROR_MESSAGE)
    }

    if (!comment) {
      Sentry.Native.captureException('Comment is not defined')

      return Alert.alert('Could not reply to comment', GENERIC_ERROR_MESSAGE)
    }

    navigation.navigate('CreateComment', {
      postId: post.id,
      parentCommentId: comment.id,
      replyingTo: 'comment',
      replyingToUsername: comment.username,
      replyingToContent: comment.content,
      replyingToCreatedAtTs: comment.created_at.getTime(),
      isReplyingToDeleted: comment.is_deleted,
      isReplyingToFlagged: comment.is_flagged,
      isReplyingToBlocked: comment.is_blocked
    })
  }, [comment, navigation, post])

  const handleCommentReplyButtonPress = useCallback(
    (comment: commentModel.Schema) => {
      if (!post) {
        Sentry.Native.captureException('Post is not defined')

        return Alert.alert('Could not reply to comment', GENERIC_ERROR_MESSAGE)
      }

      navigation.navigate('CreateComment', {
        postId: post.id,
        parentCommentId: comment.id,
        replyingTo: 'comment',
        replyingToUsername: comment.username,
        replyingToContent: comment.content,
        replyingToCreatedAtTs: comment.created_at.getTime(),
        isReplyingToDeleted: comment.is_deleted,
        isReplyingToFlagged: comment.is_flagged,
        isReplyingToBlocked: comment.is_blocked
      })
    },
    [navigation, post]
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

  const renderListHeader = useCallback(
    () =>
      post && comment ? (
        <View className="border-b border-gray-100">
          <CommentComponent
            isHeader
            comment={comment}
            communityDomainName={post.community_domain_name}
            isAuthorInternal={comment.is_author_internal}
            isPostPrivate={post.is_private}
            onEllipsisButtonPress={handleCommentEllipsisButtonPress}
            onReplyButtonPress={handleHeaderReplyButtonPress}
            onDownvoteButtonPress={() =>
              handleCommentVoteButtonPress({
                commentId: comment.id,
                oldVote: comment.current_user_vote,
                vote: 'downvote'
              })
            }
            onUpvoteButtonPress={() =>
              handleCommentVoteButtonPress({
                commentId: comment.id,
                oldVote: comment.current_user_vote,
                vote: 'upvote'
              })
            }
          />
        </View>
      ) : null,
    [
      comment,
      handleCommentEllipsisButtonPress,
      handleCommentVoteButtonPress,
      handleHeaderReplyButtonPress,
      post
    ]
  )

  const handleCommentPress = useCallback(
    (commentId: number) => {
      if (!post) {
        Sentry.Native.captureException('Post is not defined')

        return Alert.alert(
          'Could not fetch post details',
          GENERIC_ERROR_MESSAGE
        )
      }

      navigation.push('Comment', { commentId, postId: post.id })
    },
    [navigation, post]
  )

  const handleListRefresh = useCallback(() => {
    refreshPost()
    refreshComment()
    refreshComments()
  }, [refreshComment, refreshComments, refreshPost])

  const areResourcesLoading =
    isPostInitialLoading || isCommentInitialLoading || areCommentsInitialLoading

  const areResourcesDefined = post && comment

  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-white">
      <View className="w-full flex-1">
        <View className="border-b border-gray-100">
          <View className="mx-auto w-5/6 flex-row items-center justify-between">
            <Pressable className="py-4 pr-4" onPress={handleBackButtonPress}>
              <FontAwesome5 name="chevron-left" size={16} />
            </Pressable>
            <Text
              className="shrink text-center font-Poppins_700Bold text-base"
              ellipsizeMode="tail"
              numberOfLines={1}
            >
              Comment
            </Text>
            <Pressable
              className="py-4 pl-4"
              onPress={handleCommentEllipsisButtonPress}
            >
              <FontAwesome5 name="ellipsis-h" size={16} />
            </Pressable>
          </View>
        </View>

        {areResourcesLoading || !areResourcesDefined ? (
          <CommentSkeleton />
        ) : (
          <Comments
            areCommentsFetching={areCommentsFetching}
            areCommentsFetchingNextPage={areCommentsFetchingNextPage}
            comments={commentsData?.pages.map(page => page.comments).flat(1)}
            communityDomainName={post.community_domain_name}
            fetchCommentsNextPage={fetchCommentsNextPage}
            hasCommentsNextPage={hasCommentsNextPage}
            isPostPrivate={post.is_private}
            renderListHeader={renderListHeader}
            variant="child"
            isRefreshing={
              isPostRefreshing || isCommentRefreshing || areCommentsRefreshing
            }
            onCommentPress={handleCommentPress}
            onCommentReplyButtonPress={handleCommentReplyButtonPress}
            onRefresh={handleListRefresh}
          />
        )}
      </View>
    </SafeAreaView>
  )
}
