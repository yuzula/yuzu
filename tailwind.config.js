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
        'red-light': 'rgb(255, 59, 48)',
        'red-dark': 'rgb(255, 69, 58)',
        'green-light': 'rgb(52, 199, 89)',
        'green-dark': 'rgb(48, 209, 88)',
        'orange-light': 'rgb(255, 149, 0)',
        'orange-dark': 'rgb(255, 159, 10)',
        'yellow-light': 'rgb(255, 204, 0)',
        'yellow-dark': 'rgb(255, 214, 10)',
        'blue-light': 'rgb(0, 122, 255)',
        'blue-dark': 'rgb(10, 132, 255)',
        'purple-light': 'rgb(175, 82, 222)',
        'purple-dark': 'rgb(191, 90, 242)',
        'gray-light': 'rgb(142, 142, 147)',
        'gray-dark': 'rgb(142, 142, 147)',
        'pink-light': 'rgb(255, 45, 85)',
        'pink-dark': 'rgb(255, 55, 95)'
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
