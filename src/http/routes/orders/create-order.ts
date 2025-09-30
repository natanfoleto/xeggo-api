import { OrderStatus } from '@prisma/client'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { authenticate } from '@/http/middlewares/authenticate'
import { BadRequestError } from '@/http/routes/_errors/bad-request-error'
import { prisma } from '@/lib/prisma'

export async function createOrder(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(authenticate)
    .post(
      '/restaurants/:restaurantId/orders',
      {
        schema: {
          tags: ['Pedidos'],
          summary: 'Criar pedido',
          params: z.object({ restaurantId: z.string() }),
          body: z.object({
            items: z.array(
              z.object({
                productId: z.string(),
                quantity: z.number().int().positive(),
              }),
            ),
          }),
          response: {
            201: z.object({ orderId: z.string() }),
          },
        },
      },
      async (request, reply) => {
        const { userId: customerId } = await request.getCurrentUser()

        const { restaurantId } = request.params
        const { items } = request.body

        const products = await prisma.product.findMany({
          where: { id: { in: items.map((i) => i.productId) }, restaurantId },
          select: { id: true, priceInCents: true, name: true },
        })

        if (products.length !== items.length) {
          throw new BadRequestError('Produto inválido para este restaurante.')
        }

        const order = await prisma.order.create({
          data: {
            status: OrderStatus.pending,
            customerId,
            restaurantId,
            orderItems: {
              create: items.map((i) => {
                const p = products.find((pp) => pp.id === i.productId)!
                return {
                  productId: p.id,
                  quantity: i.quantity,
                  priceInCents: p.priceInCents,
                }
              }),
            },
          },
          select: { id: true },
        })

        return reply.status(201).send({ orderId: order.id })
      },
    )
}
