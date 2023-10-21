import { useActionSheet } from '@expo/react-native-action-sheet'
import { AntDesign, FontAwesome5 } from '@expo/vector-icons'
import { FunctionComponent, useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, Alert, Pressable, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import {
  GENERIC_ACTION_ERROR_TITLE,
  GENERIC_ERROR_MESSAGE,
  GENERIC_ERROR_TITLE
} from '../constants/alert'
import { formatCount } from '../helpers/count'
import { formatDuration } from '../helpers/time'
import useCurrentUser from '../hooks/useCurrentUser'
import * as postModel from '../models/post'
import * as blockService from '../services/block'
import * as postService from '../services/post'
import * as reportService from '../services/report'
import { RootStackScreenProps } from '../types'

const Post: FunctionComponent<RootStackScreenProps<'Post'>> = ({
  navigation,
  route: {
    params: { postId }
  }
}) => {
  const { showActionSheetWithOptions } = useActionSheet()

  const user = useCurrentUser()
  const [post, setPost] = useState<postModel.Schema>()

  const handleBackButtonPress = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack()
    } else {
      navigation.navigate('Tabs')
    }
  }, [navigation])

  useEffect(() => {
    ;(async () => {
      try {
        setPost(await postService.get(postId))
      } catch (error) {
        Alert.alert(GENERIC_ACTION_ERROR_TITLE, GENERIC_ERROR_MESSAGE)
      }
    })()
  }, [postId])

  const handleBlockAuthorButtonPress = useCallback(
    async (authorId: string) => {
      try {
        if (user) {
          await blockService.blockUser({
            blockerId: user.id,
            blockeeId: authorId
          })

          navigation.navigate('Tabs', {
            screen: 'Home',
            params: { shouldRefresh: true }
          })
        } else {
          Alert.alert('Could not get current user', GENERIC_ERROR_MESSAGE)
        }
      } catch (error) {
        Alert.alert(GENERIC_ERROR_TITLE, GENERIC_ERROR_MESSAGE)
      }
    },
    [navigation, user]
  )

  const handleReportPostButtonPress = useCallback(
    async (post: postModel.Schema) => {
      try {
        if (user) {
          await reportService.reportPost({
            postId: post.id,
            reporterId: user.id
          })

          Alert.alert('Post has been reported for moderation', undefined, [
            {
              onPress: () => {
                Alert.alert(
                  'Would you like to block the author of the post?',
                  undefined,
                  [
                    {
                      text: 'No'
                    },
                    {
                      text: 'Yes',
                      onPress: () => handleBlockAuthorButtonPress(post.user_id)
                    }
                  ]
                )
              }
            }
          ])
        } else {
          Alert.alert('Could not get current user', GENERIC_ERROR_MESSAGE)
        }
      } catch (error) {
        Alert.alert(GENERIC_ERROR_TITLE, GENERIC_ERROR_MESSAGE)
      }
    },
    [handleBlockAuthorButtonPress, user]
  )

  const handlePostEllipsisButtonPress = useCallback(() => {
    if (post) {
      showActionSheetWithOptions(
        {
          title: 'More actions',
          options: ['Report this post', 'Block the author', 'Cancel'],
          destructiveButtonIndex: 1,
          cancelButtonIndex: 2
        },
        async index => {
          if (index === 2) {
            return
          }

          if (index === 0) {
            await handleReportPostButtonPress(post)
          } else if (index === 1) {
            await handleBlockAuthorButtonPress(post.user_id)
          }
        }
      )
    } else {
      Alert.alert('Could not get post details', GENERIC_ERROR_MESSAGE)
    }
  }, [
    handleBlockAuthorButtonPress,
    handleReportPostButtonPress,
    post,
    showActionSheetWithOptions
  ])

  return (
    <SafeAreaView
      className="flex-1 items-center justify-center bg-white"
      edges={['top']}
    >
      {!post ? (
        <ActivityIndicator />
      ) : (
        <View className="w-full flex-1">
          <View className="flex-row items-center justify-between border-b border-gray-200 py-2">
            <View className="basis-1/3 items-start pl-2">
              <Pressable
                className="h-10 w-10 items-center justify-center rounded-lg active:bg-gray-200"
                onPress={handleBackButtonPress}
              >
                <Text className="text-apple-gray-light">
                  <FontAwesome5 name="chevron-left" size={20} />
                </Text>
              </Pressable>
            </View>
            <Text className="basis-1/3 text-center font-Poppins_600SemiBold">
              {formatCount(post.comment_count)} Comments
            </Text>
            <View className="basis-1/3 items-end pr-2">
              <Pressable
                className="h-10 w-10 items-center justify-center rounded-lg active:bg-gray-200"
                onPress={handlePostEllipsisButtonPress}
              >
                <Text className="text-apple-gray-light">
                  <FontAwesome5 name="ellipsis-h" size={20} />
                </Text>
              </Pressable>
            </View>
          </View>

          <View className="w-full border-b border-gray-200">
            <View className="mx-auto w-5/6 space-y-2 py-4">
              <Text className="font-Poppins_500Medium text-base">
                {post.content}
              </Text>

              <View className="space-y-1">
                <Text className="font-Poppins_400Regular text-apple-gray-light">
                  by&nbsp;
                  <Text className="font-Poppins_500Medium">
                    {post.username}
                  </Text>
                </Text>
                <View className="flex flex-row space-x-2">
                  <View>
                    <Text className="font-Poppins_400Regular text-apple-gray-light">
                      <AntDesign name="arrowup" size={14} />
                      &nbsp;{post.vote_count}
                    </Text>
                  </View>
                  <View>
                    <Text className="font-Poppins_400Regular text-apple-gray-light">
                      <AntDesign name="message1" size={14} />
                      &nbsp;{post.comment_count}
                    </Text>
                  </View>
                  <View>
                    <Text className="font-Poppins_400Regular text-apple-gray-light">
                      <AntDesign name="clockcircleo" size={14} />
                      &nbsp;
                      {formatDuration(Date.now() - post.created_at.getTime())}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          <View className="w-full grow" />
        </View>
      )}
    </SafeAreaView>
  )
}

export default Post
