import { useQuery } from '@tanstack/react-query'

import { commentService } from '../services/comment'

export const useComment = (id: number) =>
  useQuery({
    queryKey: ['comment', id],
    queryFn: () => commentService.get(id)
  })
