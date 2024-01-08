import React, { FunctionComponent } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'

import { Community as CommunityComponent } from '../components/Community'
import { RootStackScreenProps } from '../types'

export const ForeignCommunity: FunctionComponent<
  RootStackScreenProps<'ForeignCommunity'>
> = ({
  route: {
    params: { domainName }
  }
}) => {
  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-white">
      <CommunityComponent isForeign domainName={domainName} />
    </SafeAreaView>
  )
}
