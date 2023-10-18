export const formatDuration = (durationMs: number) => {
  if (durationMs < 1000 * 30) {
    return 'Now'
  }

  if (durationMs < 1000 * 60) {
    return `${durationMs / 1000}s`
  }

  if (durationMs < 1000 * 60 * 60) {
    return `${Math.floor(durationMs / (1000 * 60))}m`
  }

  if (durationMs < 1000 * 60 * 60 * 24) {
    return `${Math.floor(durationMs / (1000 * 60 * 60))}h`
  }

  if (durationMs < 1000 * 60 * 60 * 24 * 365) {
    return `${Math.floor(durationMs / (1000 * 60 * 60 * 24))}d`
  }

  return `${Math.round((durationMs / (1000 * 60 * 60 * 24 * 365)) * 10) / 10}y`
}
