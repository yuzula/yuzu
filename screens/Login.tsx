import { zodResolver } from '@hookform/resolvers/zod'
import React, { FunctionComponent, useCallback } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Alert, Text, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { z } from 'zod'

import { supabase } from '../clients/supabase'
import BackButton from '../components/BackButton'
import Button from '../components/Button'
import { GENERIC_ERROR_MESSAGE, GENERIC_ERROR_TITLE } from '../constants/alert'
import { RootStackScreenProps } from '../types'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(60)
})

type LoginSchema = z.infer<typeof loginSchema>

const Login: FunctionComponent<RootStackScreenProps<'Login'>> = ({
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

  const handleBackButtonPress = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack()
    }
  }, [navigation])

  const handleLogInButtonPress = useCallback(
    async ({ email, password }: LoginSchema) => {
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        })

        if (error) {
          return Alert.alert(error.message)
        }
      } catch (error) {
        Alert.alert(GENERIC_ERROR_TITLE, GENERIC_ERROR_MESSAGE)
      }
    },
    []
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
                  secureTextEntry
                  autoCapitalize="none"
                  autoComplete="off"
                  autoCorrect={false}
                  className="h-10 w-full border-b border-apple-gray-light"
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
          onPress={handleSubmit(handleLogInButtonPress)}
        >
          Log In
        </Button>
      </View>
    </SafeAreaView>
  )
}

export default Login
