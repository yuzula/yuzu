import { z } from 'zod'

export const schema = z.object({
  id: z.number(),
  user_id: z.string(),
  post_id: z.number(),
  content: z.string(),
  parentCommentId: z.number(),
  vote_count: z.number(),
  comment_count: z.number(),
  current_user_vote: z.literal('upvote').or(z.literal('downvote')).optional(),
  is_deleted: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date().optional()
})

export type Schema = z.infer<typeof schema>
