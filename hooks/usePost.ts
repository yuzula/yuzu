import { useQuery } from '@tanstack/react-query'

import { postService } from '../services/post'

export const usePost = (id: number) =>
  useQuery({
    queryKey: ['post', id],
    queryFn: () => postService.get(id)
  })
