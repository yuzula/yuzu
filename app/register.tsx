import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'expo-router'
import React, { FunctionComponent, useCallback } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Alert, Text, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { z } from 'zod'

import { supabase } from '../clients/supabase'
import BackButton from '../components/BackButton'
import Button from '../components/Button'

const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(1).max(20),
  password: z.string().min(6).max(60)
})

type RegisterSchema = z.infer<typeof registerSchema>

const Register: FunctionComponent = () => {
  const router = useRouter()

  const {
    control,
    handleSubmit,
    formState: { isValid }
  } = useForm<RegisterSchema>({
    mode: 'all',
    resolver: zodResolver(registerSchema)
  })

  const handleSignUpButtonPress = useCallback(
    async ({ email, username, password }: RegisterSchema) => {
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
        return Alert.alert(error.message)
      }

      router.push({
        pathname: '/email-verification',
        params: {
          email
        }
      })
    },
    [router]
  )

  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-white">
      <BackButton />
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
              Username
            </Text>
            <Controller
              control={control}
              defaultValue=""
              name="username"
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
          onPress={handleSubmit(handleSignUpButtonPress)}
        >
          Continue
        </Button>
      </View>
    </SafeAreaView>
  )
}

export default Register
