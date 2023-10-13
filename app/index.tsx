import { FunctionComponent } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Button, Stack, Text } from 'tamagui'

const Index: FunctionComponent = () => {
  return (
    <SafeAreaView>
      <Stack alignItems="center" justifyContent="center">
        <Text>Bruh</Text>
        <Button>Button</Button>
      </Stack>
    </SafeAreaView>
  )
}

export default Index
