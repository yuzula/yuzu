import { zodResolver } from '@hookform/resolvers/zod'
import React, { FunctionComponent, useCallback, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Text,
  TextInput,
  View
} from 'react-native'
import * as Sentry from 'sentry-expo'
import { z } from 'zod'

import { supabase } from '../clients/supabase'
import { Button } from '../components/Button'
import { GENERIC_ERROR_MESSAGE, GENERIC_ERROR_TITLE } from '../constants/alert'
import { RootStackScreenProps } from '../types'

const emailVerificationSchema = z.object({
  token: z.string().length(6)
})

type EmailVerificationSchema = z.infer<typeof emailVerificationSchema>

export const EmailVerification: FunctionComponent<
  RootStackScreenProps<'EmailVerification'>
> = ({ navigation, route: { params } }) => {
  const {
    control,
    handleSubmit,
    formState: { isValid }
  } = useForm<EmailVerificationSchema>({
    mode: 'all',
    resolver: zodResolver(emailVerificationSchema)
  })

  const [isLoading, setIsLoading] = useState(false)

  const handleBackButtonPress = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack()
    }
  }, [navigation])

  const handleVerifyButtonPress = useCallback(
    async ({ token }: EmailVerificationSchema) => {
      setIsLoading(true)

      try {
        const result = await supabase.auth.verifyOtp({
          email: params.email,
          token,
          type: 'signup'
        })

        if (result.error) {
          setIsLoading(false)

          return Alert.alert(result.error.message)
        }
      } catch (error) {
        Sentry.Native.captureException(error)

        Alert.alert(GENERIC_ERROR_TITLE, GENERIC_ERROR_MESSAGE)

        setIsLoading(false)
      }
    },
    [params.email]
  )

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 items-center justify-center"
      >
        <View className="w-4/6 items-center justify-center space-y-6">
          <Text className="text-center font-Poppins_600SemiBold text-lg">
            Enter the verification code we just sent to your email
          </Text>

          <View className="w-full">
            <Text className="font-Poppins_600SemiBold text-xs uppercase text-gray-light">
              Code
            </Text>
            <Controller
              control={control}
              name="token"
              rules={{ required: true }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className="h-10 w-full border-b border-gray-light font-Poppins_500Medium"
                  editable={!isLoading}
                  inputMode="numeric"
                  maxLength={6}
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                />
              )}
            />
          </View>

          <View className="w-full space-y-2">
            <Button
              isDisabled={!isValid}
              isLoading={isLoading}
              onPress={handleSubmit(handleVerifyButtonPress)}
            >
              Verify
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
