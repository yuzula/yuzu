import { z } from 'zod'

export const schema = z.object({
  id: z.string(),
  username: z.string(),
  community_domain_name: z.string()
})

export type Schema = z.infer<typeof schema>
