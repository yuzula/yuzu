import { POPULAR_EMAIL_DOMAINS } from '../constants/email'

export const isEmailPopular = (email: string) =>
  POPULAR_EMAIL_DOMAINS.some(domain => email.trim().endsWith(domain))
