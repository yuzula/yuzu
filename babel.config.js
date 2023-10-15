module.exports = api => {
  api.cache(true)
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'transform-inline-environment-variables',
      'react-native-reanimated/plugin',
      'nativewind/babel'
    ]
  }
}
