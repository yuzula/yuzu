import { FontAwesome5 } from '@expo/vector-icons'
import { FunctionComponent } from 'react'
import { Pressable, Text } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

interface BackButtonProps {
  onPress?: () => void
}

const BackButton: FunctionComponent<BackButtonProps> = ({ onPress }) => {
  const insets = useSafeAreaInsets()

  return (
    <Pressable
      className="absolute h-10 w-10 items-center justify-center"
      style={{ top: insets.top + 20, left: 20 }}
      onPress={onPress}
    >
      <Text className="text-apple-gray-light">
        <FontAwesome5 name="chevron-left" size={20} />
      </Text>
    </Pressable>
  )
}

export default BackButton
