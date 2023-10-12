import { StyleSheet } from 'react-native'
import { Text } from 'tamagui'

import EditScreenInfo from '../../components/EditScreenInfo'
import { View } from '../../components/Themed'

export default function TabOneScreen() {
  return (
    <View style={styles.container}>
      <Text>Tab One</Text>
      <View
        darkColor="rgba(255,255,255,0.1)"
        lightColor="#eee"
        style={styles.separator}
      />
      <EditScreenInfo path="app/(tabs)/index.tsx" />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold'
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%'
  }
})
