import { z } from 'zod'

export const profileSchema = z.object({
  id: z.string(),
  username: z.string(),
  community_domain_name: z.string(),
  vote_count: z.number()
})

export type ProfileSchema = z.infer<typeof profileSchema>
