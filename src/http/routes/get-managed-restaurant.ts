import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { authenticate } from '@/http/middlewares/authenticate'
import { prisma } from '@/lib/prisma'

export async function getManagedRestaurant(app: FastifyInstance) {
  app.register(authenticate).get(
    '/managed-restaurant',
    {
      schema: {
        tags: ['Restaurantes'],
        summary: 'Obter restaurante gerenciado pelo usuário logado',
        response: {
          200: z.object({
            id: z.string().cuid(),
            name: z.string(),
            description: z.string().nullable(),
            managerId: z.string().nullable(),
            createdAt: z.date(),
            updatedAt: z.date(),
          }),
          404: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { restaurantId } = await request.getCurrentUser()

      const restaurant = await prisma.restaurant.findUnique({
        where: { id: restaurantId },
      })

      if (!restaurant) {
        reply.status(404).send({ message: 'Restaurant not found.' })

        return
      }

      return restaurant
    },
  )
}
