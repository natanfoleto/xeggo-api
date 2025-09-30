import type { FastifyInstance } from 'fastify'

import { authenticate } from '@/http/middlewares/authenticate'

export async function signOut(app: FastifyInstance) {
  app.register(authenticate).post('/sign-out', async (request, reply) => {
    reply
      .clearCookie('token', {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      })
      .status(200)
      .send({ message: 'Desconectado com sucesso' })
  })
}
