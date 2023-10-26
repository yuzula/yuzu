import { CustomError } from 'ts-custom-error'

class HookOutOfProviderError extends CustomError {
  constructor(hook: string, provider: string) {
    super(`${hook} must be used within ${provider}`)
  }
}

export default HookOutOfProviderError
