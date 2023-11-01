import { CustomError } from 'ts-custom-error'

export class NotAuthenticatedError extends CustomError {
  constructor() {
    super('User is not authenticated')
  }
}
