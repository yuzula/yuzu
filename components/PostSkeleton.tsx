import { Skeleton } from 'moti/skeleton'
import React, { FunctionComponent, memo } from 'react'
import { View } from 'react-native'

export const PostSkeleton: FunctionComponent = memo(() => (
  <View className="mx-auto w-5/6 gap-y-4 py-4">
    <View className="gap-y-2">
      <View>
        <Skeleton colorMode="light" height={64} width="100%" />
      </View>
      <View>
        <Skeleton colorMode="light" height={12} width="40%" />
      </View>
    </View>

    <View className="flex-row justify-between">
      <View>
        <Skeleton colorMode="light" height={30} width={30} />
      </View>
      <View>
        <Skeleton colorMode="light" height={30} width={30} />
      </View>
      <View>
        <Skeleton colorMode="light" height={30} width={30} />
      </View>
    </View>

    <View className="gap-y-4">
      {[...Array(4).keys()].map(i => (
        <View key={i} className="gap-y-2">
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
  </View>
))
