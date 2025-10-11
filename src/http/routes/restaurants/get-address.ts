import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { authenticate } from '@/http/middlewares/authenticate'
import { prisma } from '@/lib/prisma'

export async function getAddress(app: FastifyInstance) {
  app
    .register(authenticate)
    .withTypeProvider<ZodTypeProvider>()
    .get(
      '/address',
      {
        schema: {
          tags: ['Endereços'],
          summary: 'Busca o endereço do restaurante',
          response: {
            200: z.object({
              address: z.object({
                zipCode: z.string().nullable(),
                street: z.string().nullable(),
                number: z.string().nullable(),
                complement: z.string().nullable(),
                neighborhood: z.string().nullable(),
                city: z.string().nullable(),
                state: z.string().nullable(),
              }),
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
          select: {
            zipCode: true,
            street: true,
            number: true,
            complement: true,
            neighborhood: true,
            city: true,
            state: true,
          },
        })

        if (!restaurant) {
          reply.status(404).send({ message: 'Restaurante não encontrado.' })

          return
        }

        return reply.status(200).send({
          address: {
            zipCode: restaurant.zipCode,
            street: restaurant.street,
            number: restaurant.number,
            complement: restaurant.complement,
            neighborhood: restaurant.neighborhood,
            city: restaurant.city,
            state: restaurant.state,
          },
        })
      },
    )
}
