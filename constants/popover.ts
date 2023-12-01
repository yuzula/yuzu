import { Platform, StatusBar } from 'react-native'

export const POPOVER_VERTICAL_OFFSET =
  Platform.OS === 'android' && StatusBar.currentHeight
    ? -StatusBar.currentHeight
    : 0
