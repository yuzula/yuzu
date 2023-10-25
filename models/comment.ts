import { z } from 'zod'

export const baseSchema = z.object({
  id: z.number(),
  username: z.string(),
  user_id: z.string(),
  post_id: z.number(),
  content: z.string(),
  vote_count: z.number(),
  parent_comment_id: z.number().optional(),
  current_user_vote: z.literal('upvote').or(z.literal('downvote')).optional(),
  is_deleted: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date().optional()
})

export type BaseSchema = z.infer<typeof baseSchema>

export const schema = baseSchema.extend({
  children: baseSchema.array()
})

export type Schema = z.infer<typeof schema>
