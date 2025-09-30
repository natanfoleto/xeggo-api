import type { FastifyInstance } from 'fastify'
import z from 'zod'

import { authenticate } from '@/http/middlewares/authenticate'
import { prisma } from '@/lib/prisma'

export async function getProfile(app: FastifyInstance) {
  app.register(authenticate).get(
    '/me',
    {
      schema: {
        tags: ['Perfil'],
        summary: 'Obter perfil do usuário logado',
        response: {
          200: z.object({
            name: z.string().min(1),
            phone: z.string().nullable(),
            email: z.string().email(),
            role: z.string(),
          }),
        },
      },
    },
    async (request) => {
      const { userId } = await request.getCurrentUser()

      const user = await prisma.user.findUniqueOrThrow({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
        },
      })

      return user
    },
  )
}
