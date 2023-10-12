module.exports = api => {
  api.cache(true)
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'transform-inline-environment-variables',
      [
        '@tamagui/babel-plugin',
        {
          components: ['tamagui'],
          config: './tamagui.config.ts',
          logTimings: true
        }
      ],
      'react-native-reanimated/plugin',
      'expo-router/babel'
    ]
  }
}
