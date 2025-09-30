export class BadRequestError extends Error {
  public statusCode = 400

  constructor(message = 'Bad request') {
    super(message)
    this.name = 'BadRequestError'
  }
}
