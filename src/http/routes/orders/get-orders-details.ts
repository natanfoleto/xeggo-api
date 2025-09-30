import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { authenticate } from '@/http/middlewares/authenticate'
import { UnauthorizedError } from '@/http/routes/_errors/unauthorized-error'
import { prisma } from '@/lib/prisma'

export async function getOrderDetails(app: FastifyInstance) {
  app
    .register(authenticate)
    .withTypeProvider<ZodTypeProvider>()
    .get(
      '/orders/:id',
      {
        schema: {
          tags: ['Orders'],
          summary:
            'Detalhes de um pedido (apenas para managers do restaurante)',
          params: z.object({
            id: z.string(),
          }),
          response: {
            200: z.object({
              id: z.string(),
              createdAt: z.date(),
              status: z.string(),
              totalInCents: z.number(),
              customer: z.object({
                name: z.string(),
                phone: z.string().nullable(),
                email: z.string().nullable(),
              }),
              orderItems: z.array(
                z.object({
                  id: z.string(),
                  priceInCents: z.number(),
                  quantity: z.number(),
                  product: z
                    .object({
                      name: z.string(),
                    })
                    .nullable(),
                }),
              ),
            }),
          },
        },
      },
      async (request) => {
        const { id: orderId } = request.params
        const { restaurantId } = await request.getCurrentUser()

        const order = await prisma.order.findFirst({
          where: {
            id: orderId,
            restaurantId,
          },
          select: {
            id: true,
            createdAt: true,
            status: true,
            customer: {
              select: {
                name: true,
                phone: true,
                email: true,
              },
            },
            orderItems: {
              select: {
                id: true,
                priceInCents: true,
                quantity: true,
                product: {
                  select: {
                    name: true,
                  },
                },
              },
              orderBy: {
                id: 'asc',
              },
            },
          },
        })

        if (!order) {
          throw new UnauthorizedError()
        }

        const totalInCents = order.orderItems.reduce(
          (acc, item) => acc + item.priceInCents * item.quantity,
          0,
        )

        return { ...order, totalInCents }
      },
    )
}
