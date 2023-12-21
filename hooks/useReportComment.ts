import { useMutation } from '@tanstack/react-query'
import * as Haptics from 'expo-haptics'
import * as Sentry from 'sentry-expo'

import { reportService } from '../services/report'

interface ReportCommentParams {
  commentId: number
}

export const useReportComment = () =>
  useMutation({
    mutationFn: ({ commentId }: ReportCommentParams) =>
      reportService.reportComment(commentId),
    onSuccess: async () => {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    },
    onError: async error => {
      Sentry.Native.captureException(error)

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
    }
  })
