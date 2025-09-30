import dayjs from 'dayjs'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { UnauthorizedError } from '@/http/routes/_errors/unauthorized-error'
import { prisma } from '@/lib/prisma'

export async function authenticateFromLink(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/auth-links/authenticate',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Autenticar via link mágico',
        querystring: z.object({
          code: z.string(),
          redirect: z.string().url(),
        }),
      },
    },
    async (request, reply) => {
      const { code, redirect } = request.query

      const link = await prisma.authLink.findUnique({ where: { code } })

      if (!link) throw new UnauthorizedError('Código inválido.')

      const createdAt = dayjs(link.createdAt)

      if (dayjs().diff(createdAt, 'minute') > 15) {
        throw new UnauthorizedError('Código expirado.')
      }

      const user = await prisma.user.findUnique({ where: { id: link.userId } })

      if (!user) throw new UnauthorizedError('Usuário não encontrado.')

      const managedRestaurant = await prisma.restaurant.findFirst({
        where: { managerId: user.id },
        select: { id: true },
      })

      const token = await reply.jwtSign({
        sub: user.id,
        restaurantId: managedRestaurant?.id ?? null,
      })

      reply.setCookie('token', token, { httpOnly: true, path: '/' })

      await prisma.authLink.delete({ where: { code } })

      return reply.redirect(redirect)
    },
  )
}
