import { AntDesign } from '@expo/vector-icons'
import React, { FunctionComponent } from 'react'
import { Pressable, Text, View } from 'react-native'

import { formatDuration } from '../helpers/time'

interface CommentProps {
  username: string
  voteCount: number
  createdAt: Date
  content: string
  onEllipsisButtonPress?: () => void
  onReplyButtonPress?: () => void
  onUpvoteButtonPress?: () => void
  onDownvoteButtonPress?: () => void
}

const Comment: FunctionComponent<CommentProps> = ({
  username,
  voteCount,
  createdAt,
  content,
  onEllipsisButtonPress,
  onReplyButtonPress,
  onUpvoteButtonPress,
  onDownvoteButtonPress
}) => (
  <View className="space-y-1 py-2">
    <View className="mx-auto w-5/6 flex-row items-center justify-between">
      <View className="flex-row items-center space-x-2">
        <Text className="font-Poppins_500Medium">{username}</Text>
        <View className="flex-row items-center">
          <Text className="text-apple-gray-light">
            <AntDesign name="arrowup" size={16} />
          </Text>
          <Text className="font-Poppins_400Regular text-apple-gray-light">
            &nbsp;
            {voteCount}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center space-x-1">
        <Pressable
          className="rounded-lg p-2 active:bg-gray-200"
          onPress={onEllipsisButtonPress}
        >
          <Text className="text-apple-gray-light">
            <AntDesign name="ellipsis1" size={16} />
          </Text>
        </Pressable>
        <Text className="font-Poppins_400Regular text-apple-gray-light">
          {formatDuration(Date.now() - createdAt.getTime())}
        </Text>
      </View>
    </View>

    <View className="mx-auto w-5/6">
      <Text className="font-Poppins_400Regular">{content}</Text>
    </View>

    <View className="mx-auto w-5/6 flex-row items-center justify-end space-x-1">
      <Pressable
        className="rounded-lg p-2 active:bg-gray-200"
        onPress={onReplyButtonPress}
      >
        <Text className="text-apple-gray-light">
          <AntDesign name="back" size={16} />
          &nbsp;
          <Text className="font-Poppins_400Regular">Reply</Text>
        </Text>
      </Pressable>
      <Pressable
        className="rounded-lg p-2 active:bg-gray-200"
        onPress={onUpvoteButtonPress}
      >
        <Text className="text-apple-gray-light">
          <AntDesign name="arrowup" size={16} />
        </Text>
      </Pressable>
      <Pressable
        className="rounded-lg p-2 active:bg-gray-200"
        onPress={onDownvoteButtonPress}
      >
        <Text className="text-apple-gray-light">
          <AntDesign name="arrowdown" size={16} />
        </Text>
      </Pressable>
    </View>
  </View>
)

export default Comment
