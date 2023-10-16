import { zodResolver } from '@hookform/resolvers/zod'
import React, { FunctionComponent, useCallback, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Alert, SafeAreaView, Text, TextInput, View } from 'react-native'
import { z } from 'zod'

import { supabase } from '../clients/supabase'
import Button from '../components/Button'
import {
  GENERIC_ACTION_ERROR_TITLE,
  GENERIC_ERROR_MESSAGE
} from '../constants/alert'
import { RootStackScreenProps } from '../types'

const emailVerificationSchema = z.object({
  token: z.string().length(6)
})

type EmailVerificationSchema = z.infer<typeof emailVerificationSchema>

const localSearchParamsSchema = z.object({
  email: z.string().email()
})

const EmailVerification: FunctionComponent<
  RootStackScreenProps<'EmailVerification'>
> = ({ route: { params } }) => {
  const { email } = localSearchParamsSchema.parse(params)

  const {
    control,
    handleSubmit,
    formState: { isValid }
  } = useForm<EmailVerificationSchema>({
    mode: 'all',
    resolver: zodResolver(emailVerificationSchema)
  })

  const [isLoading, setIsLoading] = useState(false)

  const handleVerifyButtonPress = useCallback(
    async ({ token }: EmailVerificationSchema) => {
      setIsLoading(true)

      try {
        const result = await supabase.auth.verifyOtp({
          email,
          token,
          type: 'signup'
        })

        if (result.error) {
          return Alert.alert(result.error.message)
        }
      } catch (error) {
        Alert.alert(GENERIC_ACTION_ERROR_TITLE, GENERIC_ERROR_MESSAGE)
      } finally {
        setIsLoading(false)
      }
    },
    [email]
  )

  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-white">
      <View className="w-4/6 items-center justify-center space-y-6">
        <Text className="text-center font-Poppins_600SemiBold text-lg">
          Enter the verification code we just sent to your email
        </Text>

        <View className="w-full">
          <Text className="font-Poppins_600SemiBold text-xs uppercase text-apple-gray-light">
            Code
          </Text>
          <Controller
            control={control}
            defaultValue=""
            name="token"
            rules={{ required: true }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className="h-10 w-full border-b border-apple-gray-light"
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
          onPress={handleSubmit(handleVerifyButtonPress)}
        >
          Verify
        </Button>
      </View>
    </SafeAreaView>
  )
}

export default EmailVerification
