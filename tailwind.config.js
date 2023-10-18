/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './screens/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: '#fcf951',
        'primary-darker': '#e3e049',
        'apple-red-light': 'rgb(255, 59, 48)',
        'apple-red-dark': 'rgb(255, 69, 58)',
        'apple-green-light': 'rgb(52, 199, 89)',
        'apple-green-dark': 'rgb(48, 209, 88)',
        'apple-blue-light': 'rgb(0, 122, 255)',
        'apple-blue-dark': 'rgb(10, 132, 255)',
        'apple-purple-light': 'rgb(175, 82, 222)',
        'apple-purple-dark': 'rgb(191, 90, 242)',
        'apple-gray-light': 'rgb(142, 142, 147)',
        'apple-gray-dark': 'rgb(142, 142, 147)'
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
