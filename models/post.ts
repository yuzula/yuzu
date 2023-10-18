import { z } from 'zod'

export const postDtoSchema = z.object({
  id: z.number(),
  user_id: z.string(),
  community_domain_name: z.string(),
  content: z.string(),
  vote_count: z.number(),
  comment_count: z.number(),
  is_private: z.boolean(),
  is_flagged: z.boolean(),
  is_deleted: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date().optional()
})

export const postSchema = postDtoSchema.extend({
  current_user_vote: z.literal('upvote').or(z.literal('downvote')).nullable()
})

export type PostSchema = z.infer<typeof postSchema>
