import { z } from 'zod'

export const schema = z.object({
  id: z.number(),
  username: z.string().optional(),
  user_id: z.string().optional(),
  post_id: z.number(),
  content: z.string().optional(),
  vote_count: z.number(),
  comment_count: z.number(),
  depth: z.number(),
  is_author_internal: z.boolean(),
  current_user_vote: z.literal('upvote').or(z.literal('downvote')).optional(),
  is_deleted: z.boolean(),
  is_flagged: z.boolean(),
  is_blocked: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date().optional()
})

export type Schema = z.infer<typeof schema>

export * as commentModel from './comment'
