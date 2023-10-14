import { FontAwesome5 } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { FunctionComponent, useCallback } from 'react'
import { Pressable } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const BackButton: FunctionComponent = () => {
  const router = useRouter()
  const insets = useSafeAreaInsets()

  const handleBackButtonPress = useCallback(() => {
    if (router.canGoBack()) {
      router.back()
    }
  }, [router])

  return (
    <Pressable
      className="absolute h-10 w-10 items-center justify-center"
      style={{ top: insets.top + 20, left: 20 }}
      onPress={handleBackButtonPress}
    >
      <FontAwesome5 color="rgb(142, 142, 147)" name="chevron-left" size={20} />
    </Pressable>
  )
}

export default BackButton
