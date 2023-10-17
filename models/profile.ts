import { z } from 'zod'

export const profileSchema = z.object({
  id: z.string(),
  username: z.string(),
  community_domain_name: z.string()
})

export type ProfileSchema = z.infer<typeof profileSchema>
