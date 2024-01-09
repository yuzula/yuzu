import React, {
  FunctionComponent,
  memo,
  ReactNode,
  useCallback,
  useMemo
} from 'react'
import {
  ActivityIndicator,
  FlatList,
  ListRenderItemInfo,
  Text,
  View
} from 'react-native'

import { commentModel } from '../models/comment'
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
          comment={comment}
          communityDomainName={communityDomainName}
          isAuthorInternal={comment.is_author_internal}
          isPostPrivate={isPostPrivate}
          variant={variant}
          onPress={onCommentPress}
          onReplyButtonPress={() => onCommentReplyButtonPress(comment)}
        />
      ),
      [
        communityDomainName,
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
