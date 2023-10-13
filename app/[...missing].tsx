import { Link } from 'expo-router'
import React, { FunctionComponent } from 'react'
import { Text, View } from 'react-native'

const NotFound: FunctionComponent = () => (
  <View>
    <Text>You ain&apos;t supposed to be here!</Text>
    <Text>
      You&apos;ve somehow landed on a screen that shouldn&apos;t exist
    </Text>
    <Link href="/">
      <Text>Take me home</Text>
    </Link>
  </View>
)

export default NotFound
