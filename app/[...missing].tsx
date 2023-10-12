import { Link } from 'expo-router'
import { FunctionComponent } from 'react'
import { Heading, Stack, Text } from 'tamagui'

const NotFound: FunctionComponent = () => (
  <Stack>
    <Heading>You ain&apos;t supposed to be here!</Heading>
    <Text>
      You&apos;ve somehow landed on a screen that shouldn&apos;t exist
    </Text>
    <Link href="/">
      <Text>Take me home</Text>
    </Link>
  </Stack>
)

export default NotFound
