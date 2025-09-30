export class NotAManagerError extends Error {
  public statusCode = 403

  constructor(message = 'Somente gerentes podem executar esta ação.') {
    super(message)
    this.name = 'NotAManagerError'
  }
}
