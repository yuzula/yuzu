// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config')
const { withNativeWind } = require('nativewind/metro')

// eslint-disable-next-line no-undef
module.exports = withNativeWind(getDefaultConfig(__dirname), {
  input: './global.css'
})
