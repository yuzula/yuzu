import { useFonts as useExpoFonts } from 'expo-font'

const useFonts = () => {
  const [isLoaded, error] = useExpoFonts({
    Inter: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
    InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf')
  })

  return {
    isLoading: !isLoaded,
    error
  }
}

export default useFonts
