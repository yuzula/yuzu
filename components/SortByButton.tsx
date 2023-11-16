import { useActionSheet } from '@expo/react-native-action-sheet'
import { FontAwesome5 } from '@expo/vector-icons'
import React, { FunctionComponent, useCallback } from 'react'
import { Pressable, Text } from 'react-native'

import { SortBy } from '../types/post'

interface SortByButtonProps {
  sortBy: SortBy
  onChange?: (sortBy: SortBy) => void
}

export const SortByButton: FunctionComponent<SortByButtonProps> = ({
  sortBy,
  onChange
}) => {
  const { showActionSheetWithOptions } = useActionSheet()

  const handleSortButtonPress = useCallback(() => {
    showActionSheetWithOptions(
      {
        title: 'Sort posts by',
        options: ['Hot', 'New', 'Controversial', 'Cancel'],
        cancelButtonIndex: 3
      },
      async index => {
        if (index === 3) {
          return
        }

        switch (index) {
          case 0:
            onChange?.('hot')
            break
          case 1:
            onChange?.('new')
            break
          case 2:
            onChange?.('controversial')
            break
        }
      }
    )
  }, [onChange, showActionSheetWithOptions])

  return (
    <Pressable onPress={handleSortButtonPress}>
      <Text className="font-Poppins_700Bold text-gray-600">
        {sortBy === 'hot' ? (
          <FontAwesome5 name="fire" />
        ) : sortBy === 'new' ? (
          <FontAwesome5 name="hourglass-start" />
        ) : (
          <FontAwesome5 name="scroll" />
        )}
        {'  '}Sort by <Text className="capitalize">{sortBy}</Text>
        {'  '}
        <FontAwesome5 name="chevron-down" />
      </Text>
    </Pressable>
  )
}
