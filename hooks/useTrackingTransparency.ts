import { requestTrackingPermissionsAsync } from 'expo-tracking-transparency'
import { useEffect } from 'react'

export const useTrackingTransparency = () => {
  useEffect(() => {
    ;(async () => {
      const { granted: _granted } = await requestTrackingPermissionsAsync()
    })()
  }, [])
}
