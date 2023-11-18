import { zodResolver } from '@hookform/resolvers/zod'
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
import { RootStackScreenProps } from '../types'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(60)
})

type LoginSchema = z.infer<typeof loginSchema>

export const Login: FunctionComponent<RootStackScreenProps<'Login'>> = ({
  navigation
}) => {
  const {
    control,
    handleSubmit,
    formState: { isValid }
  } = useForm<LoginSchema>({
    mode: 'all',
    resolver: zodResolver(loginSchema)
  })

  const [isLoading, setIsLoading] = useState(false)

  const handleBackButtonPress = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack()
    }
  }, [navigation])

  const handleLogInButtonPress = useCallback(
    async ({ email, password }: LoginSchema) => {
      setIsLoading(true)

      try {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        })

        if (error) {
          setIsLoading(false)

          return Alert.alert(error.message)
        }
      } catch (error) {
        Sentry.Native.captureException(error)

        Alert.alert(GENERIC_ERROR_TITLE, GENERIC_ERROR_MESSAGE)

        setIsLoading(false)
      }
    },
    []
  )

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 items-center justify-center"
      >
        <View className="w-4/6 items-center justify-center space-y-8">
          <View className="w-full space-y-4">
            <View className="w-full">
              <Text className="font-Poppins_600SemiBold text-xs uppercase text-gray-light">
                Email
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
                    className="h-10 w-full border-b border-gray-light font-Poppins_500Medium"
                    editable={!isLoading}
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                  />
                )}
              />
            </View>

            <View className="w-full">
              <Text className="font-Poppins_600SemiBold text-xs uppercase text-gray-light">
                Password
              </Text>
              <Controller
                control={control}
                name="password"
                rules={{ required: true }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    secureTextEntry
                    autoCapitalize="none"
                    autoComplete="off"
                    autoCorrect={false}
                    className="h-10 w-full border-b border-gray-light font-Poppins_500Medium"
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
              onPress={handleSubmit(handleLogInButtonPress)}
            >
              Log In
            </Button>
            <Button
              isDisabled={isLoading}
              variant="secondary"
              onPress={handleBackButtonPress}
            >
              Cancel
            </Button>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
