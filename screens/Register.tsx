import { zodResolver } from '@hookform/resolvers/zod'
import * as Linking from 'expo-linking'
import React, { FunctionComponent, useCallback, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  View
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as Sentry from 'sentry-expo'
import { z } from 'zod'

import { supabase } from '../clients/supabase'
import { Button } from '../components/Button'
import { GENERIC_ERROR_MESSAGE, GENERIC_ERROR_TITLE } from '../constants/alert'
import { retryPromise } from '../helpers/promise'
import { RootStackScreenProps } from '../types'

const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().regex(/^\w+$/).min(1).max(20),
  password: z.string().min(6).max(60)
})

type RegisterSchema = z.infer<typeof registerSchema>

export const Register: FunctionComponent<RootStackScreenProps<'Register'>> = ({
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
        const { error } = await retryPromise(() =>
          supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                username
              }
            }
          })
        )

        if (error) {
          setIsLoading(false)

          switch (error.message) {
            case 'duplicate key value violates unique constraint "profiles_username_key"':
              return Alert.alert('Username is already taken')
            default:
              return Alert.alert(error.message)
          }
        }

        navigation.navigate('EmailVerification', { email })
      } catch (error) {
        Sentry.Native.captureException(error)

        Alert.alert(GENERIC_ERROR_TITLE, GENERIC_ERROR_MESSAGE)
      } finally {
        setIsLoading(false)
      }
    },
    [navigation]
  )

  const handlePrivacyPolicyPress = useCallback(async () => {
    const url = 'https://yuzu.la/privacy'

    if (await Linking.canOpenURL(url)) {
      await Linking.openURL(url)
    } else {
      Sentry.Native.captureException(new Error('Could not open Privacy Policy'))

      Alert.alert('Could not open Privacy Policy', GENERIC_ERROR_MESSAGE)
    }
  }, [])

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 items-center justify-center"
      >
        <View className="w-4/6 items-center justify-center space-y-8">
          <View className="w-full space-y-4">
            <View className="w-full">
              <Text className="font-Poppins_600SemiBold text-xs uppercase text-apple-gray-light">
                School or workplace email
              </Text>
              <Controller
                control={control}
                name="email"
                rules={{ required: true }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    autoCapitalize="none"
                    autoComplete="off"
                    autoCorrect={false}
                    className="h-10 w-full border-b border-apple-gray-light font-Poppins_400Regular"
                    editable={!isLoading}
                    inputMode="email"
                    placeholder="mark@harvard.edu"
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
                name="username"
                rules={{ required: true }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    autoCapitalize="none"
                    autoComplete="off"
                    autoCorrect={false}
                    className="h-10 w-full border-b border-apple-gray-light font-Poppins_400Regular"
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
                name="password"
                rules={{ required: true }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    autoCapitalize="none"
                    autoComplete="off"
                    autoCorrect={false}
                    className="h-10 w-full border-b border-apple-gray-light font-Poppins_400Regular"
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

          <View className="w-full space-y-2">
            <Button
              isDisabled={!isValid}
              isLoading={isLoading}
              onPress={handleSubmit(handleSignUpButtonPress)}
            >
              Sign Up
            </Button>
            <Button
              isDisabled={isLoading}
              variant="secondary"
              onPress={handleBackButtonPress}
            >
              Cancel
            </Button>
            <Text className="text-center font-Poppins_400Regular text-apple-gray-light">
              By signing up, you agree to our&nbsp;
              <Text
                className="font-Poppins_500Medium"
                onPress={handlePrivacyPolicyPress}
              >
                Privacy Policy
              </Text>
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
