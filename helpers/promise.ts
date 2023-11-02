interface RetryPromiseOptions {
  maxRetries?: number
  delay?: number
}

export const retryPromise = async <T>(
  promiseFactory: () => Promise<T>,
  { maxRetries = 3, delay = 100 }: RetryPromiseOptions = {}
): Promise<T> => {
  try {
    return await promiseFactory()
  } catch (error) {
    if (maxRetries <= 0) {
      throw error
    }

    await new Promise<void>(resolve => {
      setTimeout(resolve, delay)
    })

    return retryPromise(promiseFactory, {
      maxRetries: maxRetries - 1,
      delay
    })
  }
}
