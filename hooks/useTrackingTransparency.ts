import { requestTrackingPermissionsAsync } from 'expo-tracking-transparency'
import { useEffect } from 'react'

const useTrackingTransparency = () => {
  useEffect(() => {
    ;(async () => {
      const { granted: _granted } = await requestTrackingPermissionsAsync()
    })()
  }, [])
}

export default useTrackingTransparency
