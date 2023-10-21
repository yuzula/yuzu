export const formatDuration = (durationMs: number) => {
  // Duration less than 1 min
  if (durationMs < 1000 * 60) {
    return 'Now'
  }

  // Duration less than 1 hour
  if (durationMs < 1000 * 60 * 60) {
    return `${Math.floor(durationMs / (1000 * 60))}m`
  }

  // Duration less than 1 day
  if (durationMs < 1000 * 60 * 60 * 24) {
    return `${Math.floor(durationMs / (1000 * 60 * 60))}h`
  }

  // Duration less than 1 year
  if (durationMs < 1000 * 60 * 60 * 24 * 365) {
    return `${Math.floor(durationMs / (1000 * 60 * 60 * 24))}d`
  }

  return `${Math.round((durationMs / (1000 * 60 * 60 * 24 * 365)) * 10) / 10}y`
}
