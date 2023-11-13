import { z } from 'zod'

export const schema = z.object({
  domain_name: z.string(),
  member_count: z.number(),
  created_at: z.coerce.date()
})

export type Schema = z.infer<typeof schema>

export * as communityModel from './community'
