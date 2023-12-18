import { useMutation } from '@tanstack/react-query'
import * as Haptics from 'expo-haptics'
import * as Sentry from 'sentry-expo'

import { reportService } from '../services/report'

interface ReportPostParams {
  postId: number
}

export const useReportPost = () =>
  useMutation({
    mutationFn: ({ postId }: ReportPostParams) =>
      reportService.reportPost(postId),
    onSuccess: async () => {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    },
    onError: async error => {
      Sentry.Native.captureException(error)

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
    }
  })
