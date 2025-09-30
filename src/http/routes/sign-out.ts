import type { FastifyInstance } from 'fastify'

import { authenticate } from '@/http/middlewares/authenticate'

export async function signOut(app: FastifyInstance) {
  app.register(authenticate).post('/sign-out', async (request, reply) => {
    // Limpa o cookie de autenticação
    reply
      .clearCookie('token', {
        path: '/', // importante definir o path correto
        httpOnly: true, // segurança: só acessível pelo servidor
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax', // ajusta conforme sua política
      })
      .status(200)
      .send({ message: 'Desconectado com sucesso' })
  })
}
