/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#fcf951'
      },
      fontFamily: {
        Poppins_100Thin: 'Poppins_100Thin',
        Poppins_100Thin_Italic: 'Poppins_100Thin_Italic',
        Poppins_200ExtraLight: 'Poppins_200ExtraLight',
        Poppins_200ExtraLight_Italic: 'Poppins_200ExtraLight_Italic',
        Poppins_300Light: 'Poppins_300Light',
        Poppins_300Light_Italic: 'Poppins_300Light_Italic',
        Poppins_400Regular: 'Poppins_400Regular',
        Poppins_400Regular_Italic: 'Poppins_400Regular_Italic',
        Poppins_500Medium: 'Poppins_500Medium',
        Poppins_500Medium_Italic: 'Poppins_500Medium_Italic',
        Poppins_600SemiBold: 'Poppins_600SemiBold',
        Poppins_600SemiBold_Italic: 'Poppins_600SemiBold_Italic',
        Poppins_700Bold: 'Poppins_700Bold',
        Poppins_700Bold_Italic: 'Poppins_700Bold_Italic',
        Poppins_800ExtraBold: 'Poppins_800ExtraBold',
        Poppins_800ExtraBold_Italic: 'Poppins_800ExtraBold_Italic',
        Poppins_900Black: 'Poppins_900Black',
        Poppins_900Black_Italic: 'Poppins_900Black_Italic'
      }
    }
  },
  plugins: []
}
