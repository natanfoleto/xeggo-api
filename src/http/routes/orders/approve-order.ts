import { OrderStatus } from '@prisma/client'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { authenticate } from '@/http/middlewares/authenticate'
import { NotAManagerError } from '@/http/routes/_errors/not-a-manager-error'
import { UnauthorizedError } from '@/http/routes/_errors/unauthorized-error'
import { prisma } from '@/lib/prisma'

export async function approveOrder(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(authenticate)
    .patch(
      '/orders/:id/approve',
      {
        schema: {
          tags: ['Pedidos'],
          summary: 'Atualizar status do pedido para processing',
          params: z.object({ id: z.string() }),
        },
      },
      async (request, reply) => {
        const { restaurantId } = await request.getCurrentUser()

        if (!restaurantId) throw new NotAManagerError()

        const { id: orderId } = request.params

        const order = await prisma.order.findUnique({
          where: { id: orderId },
          select: { restaurantId: true, status: true },
        })

        if (!order || order.restaurantId !== restaurantId) {
          throw new UnauthorizedError('Pedido não pertence ao restaurante.')
        }

        await prisma.order.update({
          where: { id: orderId },
          data: { status: OrderStatus.processing },
        })

        return reply.status(204).send()
      },
    )
}
