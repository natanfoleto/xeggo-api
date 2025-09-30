export class UnauthorizedError extends Error {
  public statusCode = 401

  constructor(message = 'Unauthorized') {
    super(message)
    this.name = 'UnauthorizedError'
  }
}
