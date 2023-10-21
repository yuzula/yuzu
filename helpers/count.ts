export const formatCount = (count: number) => {
  if (count < 1000) {
    return count.toString()
  }

  return `${(count / 1000).toFixed(1)}k`
}
