import { OrderStatus } from '@prisma/client'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { authenticate } from '@/http/middlewares/authenticate'
import { UnauthorizedError } from '@/http/routes/_errors/unauthorized-error'
import { prisma } from '@/lib/prisma'

export async function deliverOrder(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(authenticate)
    .patch(
      '/orders/:id/deliver',
      {
        schema: {
          tags: ['Pedidos'],
          summary: 'Atualizar status do pedido para delivered',
          params: z.object({
            id: z
              .string({
                required_error: 'O ID do pedido é obrigatório',
                invalid_type_error: 'O ID do pedido deve ser uma string',
              })
              .cuid('O ID do pedido deve ser um CUID válido')
              .max(30, 'O ID do pedido deve ter no máximo 30 caracteres'),
          }),
        },
      },
      async (request, reply) => {
        const { restaurantId } = await request.getCurrentUser()

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
          data: { status: OrderStatus.delivered },
        })

        return reply.status(204).send()
      },
    )
}
