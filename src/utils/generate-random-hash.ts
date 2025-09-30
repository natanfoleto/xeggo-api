import { randomBytes } from 'crypto'

export function generateRandomHash() {
  const buffer = randomBytes(2)

  const hash = buffer.toString('hex').substring(0, 4)
  return hash
}
