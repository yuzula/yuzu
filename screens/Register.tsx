import { zodResolver } from '@hookform/resolvers/zod'
import React, { FunctionComponent, useCallback, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Alert, Text, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { z } from 'zod'

import { supabase } from '../clients/supabase'
import BackButton from '../components/BackButton'
import Button from '../components/Button'
import { GENERIC_ERROR_MESSAGE, GENERIC_ERROR_TITLE } from '../constants/alert'
import { RootStackScreenProps } from '../types'

const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(1).max(20),
  password: z.string().min(6).max(60)
})

type RegisterSchema = z.infer<typeof registerSchema>

const Register: FunctionComponent<RootStackScreenProps<'Register'>> = ({
  navigation
}) => {
  const {
    control,
    handleSubmit,
    formState: { isValid }
  } = useForm<RegisterSchema>({
    mode: 'all',
    resolver: zodResolver(registerSchema)
  })

  const [isLoading, setIsLoading] = useState(false)

  const handleBackButtonPress = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack()
    }
  }, [navigation])

  const handleSignUpButtonPress = useCallback(
    async ({ email, username, password }: RegisterSchema) => {
      setIsLoading(true)

      try {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username
            }
          }
        })

        if (error) {
          switch (error.message) {
            case 'duplicate key value violates unique constraint "profiles_username_key"':
              return Alert.alert('Username is already taken')
            default:
              return Alert.alert(error.message)
          }
        }

        navigation.navigate('EmailVerification', { email })
      } catch (error) {
        Alert.alert(GENERIC_ERROR_TITLE, GENERIC_ERROR_MESSAGE)
      } finally {
        setIsLoading(false)
      }
    },
    [navigation]
  )

  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-white">
      <BackButton onPress={handleBackButtonPress} />
      <View className="w-4/6 items-center justify-center space-y-8">
        <View className="w-full space-y-4">
          <View className="w-full">
            <Text className="font-Poppins_600SemiBold text-xs uppercase text-apple-gray-light">
              Email
            </Text>
            <Controller
              control={control}
              defaultValue=""
              name="email"
              rules={{ required: true }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  autoCapitalize="none"
                  autoComplete="off"
                  autoCorrect={false}
                  className="h-10 w-full border-b border-apple-gray-light"
                  editable={!isLoading}
                  inputMode="email"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                />
              )}
            />
          </View>

          <View className="w-full">
            <Text className="font-Poppins_600SemiBold text-xs uppercase text-apple-gray-light">
              Username
            </Text>
            <Controller
              control={control}
              defaultValue=""
              name="username"
              rules={{ required: true }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  autoCapitalize="none"
                  autoComplete="off"
                  autoCorrect={false}
                  className="h-10 w-full border-b border-apple-gray-light"
                  editable={!isLoading}
                  maxLength={20}
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                />
              )}
            />
          </View>

          <View className="w-full">
            <Text className="font-Poppins_600SemiBold text-xs uppercase text-apple-gray-light">
              Password
            </Text>
            <Controller
              control={control}
              defaultValue=""
              name="password"
              rules={{ required: true }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  autoCapitalize="none"
                  autoComplete="off"
                  autoCorrect={false}
                  className="h-10 w-full border-b border-apple-gray-light"
                  editable={!isLoading}
                  maxLength={60}
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                />
              )}
            />
          </View>
        </View>

        <Button
          isDisabled={!isValid}
          isLoading={isLoading}
          onPress={handleSubmit(handleSignUpButtonPress)}
        >
          Sign Up
        </Button>
      </View>
    </SafeAreaView>
  )
}

export default Register
