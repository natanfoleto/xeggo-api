import type { FastifyInstance } from 'fastify'
import { fastifyPlugin } from 'fastify-plugin'

import { NotAManagerError } from '@/http/routes/_errors/not-a-manager-error'
import { UnauthorizedError } from '@/http/routes/_errors/unauthorized-error'
import { prisma } from '@/lib/prisma'

export const authenticate = fastifyPlugin(async (app: FastifyInstance) => {
  app.addHook('preHandler', async (request) => {
    request.getCurrentUser = async () => {
      try {
        const token = request.cookies.token

        if (!token) throw new UnauthorizedError('Token não encontrado.')

        request.headers.authorization = `Bearer ${token}`

        const { sub } = await request.jwtVerify<{ sub: string }>()

        const user = await prisma.user.findFirst({
          where: { id: sub },
        })

        if (!user) throw new UnauthorizedError('Nenhum usuário encontrado.')

        const restaurant = await prisma.restaurant.findFirst({
          where: { managerId: user.id },
        })

        if (!restaurant) throw new NotAManagerError()

        return { userId: user.id, restaurantId: restaurant.id }
      } catch (err) {
        console.log(err)

        throw new UnauthorizedError('Token de autenticação inválido.')
      }
    }
  })
})
