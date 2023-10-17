import { zodResolver } from '@hookform/resolvers/zod'
import { FunctionComponent, useCallback, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Text, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { z } from 'zod'

import BackButton from '../components/BackButton'
import Button from '../components/Button'
import { RootStackScreenProps } from '../types'

const createPostSchema = z.object({
  title: z.string().min(1).max(300),
  content: z.string().min(1).max(10000)
})

type CreatePostSchema = z.infer<typeof createPostSchema>

const CreatePost: FunctionComponent<RootStackScreenProps<'CreatePost'>> = ({
  navigation
}) => {
  const {
    control,
    handleSubmit,
    formState: { isValid }
  } = useForm<CreatePostSchema>({
    mode: 'all',
    resolver: zodResolver(createPostSchema)
  })

  const [isLoading, setIsLoading] = useState(false)

  const handleSubmitButtonPress = useCallback(
    async ({ title, content }: CreatePostSchema) => {
      setIsLoading(true)
      try {
      } catch (error) {
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  const handleBackButtonPress = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack()
    }
  }, [navigation])

  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-white">
      <BackButton onPress={handleBackButtonPress} />
      <View className="w-4/6 space-y-6">
        <Text className="font-Poppins_700Bold text-xl">Create a post</Text>

        <View className="w-full">
          <Text className="font-Poppins_600SemiBold text-xs uppercase text-apple-gray-light">
            Title
          </Text>
          <Controller
            control={control}
            defaultValue=""
            name="title"
            rules={{ required: true }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className="h-10 w-full border-b border-apple-gray-light"
                editable={!isLoading}
                maxLength={300}
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
              />
            )}
          />
        </View>

        <View className="w-full">
          <Text className="font-Poppins_600SemiBold text-xs uppercase text-apple-gray-light">
            Body text
          </Text>
          <Controller
            control={control}
            defaultValue=""
            name="content"
            rules={{ required: true }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                multiline
                className="h-10 w-full border-b border-apple-gray-light pb-20"
                editable={!isLoading}
                maxLength={10000}
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
              />
            )}
          />
        </View>

        <Button
          isDisabled={!isValid}
          isLoading={isLoading}
          onPress={handleSubmit(handleSubmitButtonPress)}
        >
          Submit
        </Button>
      </View>
    </SafeAreaView>
  )
}

export default CreatePost
