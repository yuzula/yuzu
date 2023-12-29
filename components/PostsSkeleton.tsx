import { Skeleton } from 'moti/skeleton'
import React, { FunctionComponent, memo } from 'react'
import { View } from 'react-native'

export const PostsSkeleton: FunctionComponent = memo(() => (
  <View className="w-full grow">
    {[...Array(4).keys()].map(i => (
      <View key={i} className="mx-auto w-5/6 space-y-2 py-4">
        <View>
          <Skeleton colorMode="light" radius="round" />
        </View>
        <View>
          <Skeleton colorMode="light" height={12} width="60%" />
        </View>
        <View>
          <Skeleton colorMode="light" height={12} width="80%" />
        </View>
        <View>
          <Skeleton colorMode="light" height={12} width="90%" />
        </View>
      </View>
    ))}
  </View>
))
