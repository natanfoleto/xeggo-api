import type { Prisma } from '@prisma/client'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { authenticate } from '@/http/middlewares/authenticate'
import { prisma } from '@/lib/prisma'

export async function getOrders(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(authenticate)
    .get(
      '/orders',
      {
        schema: {
          tags: ['Pedidos'],
          summary: 'Listar pedidos (admin restaurante)',
          querystring: z.object({
            pageIndex: z.coerce.number().int().min(0).default(0),
            orderId: z.string().optional(),
            customerName: z.string().optional(),
            status: z
              .enum([
                'pending',
                'canceled',
                'processing',
                'delivering',
                'delivered',
              ])
              .optional(),
          }),
          response: {
            200: z.object({
              orders: z.array(
                z.object({
                  orderId: z.string(),
                  createdAt: z.string(),
                  customerName: z.string(),
                  total: z.number(),
                  status: z.enum([
                    'pending',
                    'canceled',
                    'processing',
                    'delivering',
                    'delivered',
                  ]),
                }),
              ),
              meta: z.object({
                pageIndex: z.number().int(),
                totalCount: z.number().int(),
                perPage: z.number().int(),
              }),
            }),
          },
        },
      },
      async (request) => {
        const { restaurantId } = await request.getCurrentUser()
        const { pageIndex, orderId, customerName, status } = request.query

        const where: Prisma.OrderWhereInput = { restaurantId }

        if (orderId) where.id = orderId
        if (status) where.status = status
        if (customerName) {
          where.customer = {
            name: { contains: customerName, mode: 'insensitive' },
          }
        }

        const perPage = 10

        const [ordersRaw, totalCount] = await Promise.all([
          prisma.order.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: perPage,
            skip: pageIndex * perPage,
            select: {
              id: true,
              createdAt: true,
              status: true,
              customer: { select: { name: true } },
              orderItems: { select: { priceInCents: true, quantity: true } },
            },
          }),
          prisma.order.count({ where }),
        ])

        const orders = ordersRaw.map((o) => ({
          orderId: o.id,
          createdAt: o.createdAt.toISOString(),
          customerName: o.customer.name,
          status: o.status,
          total: o.orderItems.reduce(
            (acc, item) => acc + item.priceInCents * item.quantity,
            0,
          ),
        }))

        return {
          orders,
          meta: {
            pageIndex,
            totalCount,
            perPage,
          },
        }
      },
    )
}
