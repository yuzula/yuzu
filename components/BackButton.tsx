import { FontAwesome5 } from '@expo/vector-icons'
import { FunctionComponent } from 'react'
import { Pressable } from 'react-native'
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
      <FontAwesome5 color="rgb(142, 142, 147)" name="chevron-left" size={20} />
    </Pressable>
  )
}

export default BackButton
