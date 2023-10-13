import FontAwesome from '@expo/vector-icons/FontAwesome'
import { useFonts as useExpoFonts } from 'expo-font'

const useFonts = () => {
  const [isLoaded, error] = useExpoFonts({
    ...FontAwesome.font
  })

  return {
    isLoading: !isLoaded,
    error
  }
}

export default useFonts
