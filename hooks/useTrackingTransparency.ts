import { requestTrackingPermissionsAsync } from 'expo-tracking-transparency'
import { useEffect } from 'react'
import { AppState } from 'react-native'

export const useInitialTrackingTransparency = () => {
  useEffect(() => {
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') {
        requestTrackingPermissionsAsync()

        subscription.remove()
      }
    })
  }, [])
}
