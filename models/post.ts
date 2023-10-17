import { z } from 'zod'

export const postSchema = z.object({
  id: z.number(),
  user_id: z.string(),
  community_domain_name: z.string(),
  title: z.string(),
  content: z.string(),
  vote_count: z.number(),
  is_private: z.boolean(),
  is_flagged: z.boolean(),
  is_deleted: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date().optional()
})

export type PostSchema = z.infer<typeof postSchema>
