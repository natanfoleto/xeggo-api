import { createId } from '@paralleldrive/cuid2'
import type { FastifyInstance } from 'fastify'
import z from 'zod'

import { UnauthorizedError } from '@/http/routes/_errors/unauthorized-error'
import { prisma } from '@/lib/prisma'

export async function sendAuthenticationLink(app: FastifyInstance) {
  app.post(
    '/authenticate',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Envia link mágico de autenticação por email',
        body: z.object({
          email: z.string().email(),
        }),
      },
    },
    async (request, reply) => {
      const { email } = request.body as { email: string }

      const userFromEmail = await prisma.user.findFirst({
        where: { email },
        select: { id: true, email: true },
      })

      if (!userFromEmail) {
        throw new UnauthorizedError()
      }

      const authLinkCode = createId()

      await prisma.authLink.create({
        data: {
          userId: userFromEmail.id,
          code: authLinkCode,
        },
      })

      const authLink = new URL(
        '/auth-links/authenticate',
        process.env.API_BASE_URL,
      )

      authLink.searchParams.set('code', authLinkCode)
      authLink.searchParams.set('redirect', process.env.AUTH_REDIRECT_URL)

      console.log(authLink.toString())

      reply.code(204).send()
    },
  )
}
