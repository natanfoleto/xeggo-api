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
            pageIndex: z.coerce
              .number({
                invalid_type_error: 'O índice da página deve ser um número',
              })
              .int('O índice da página deve ser um número inteiro')
              .min(0, 'O índice da página deve ser no mínimo 0')
              .default(0),
            orderId: z
              .string({
                invalid_type_error: 'O ID do pedido deve ser uma string',
              })
              .cuid('O ID do pedido deve ser um CUID válido')
              .max(30, 'O ID do pedido deve ter no máximo 30 caracteres')
              .optional(),
            customerName: z
              .string({
                invalid_type_error: 'O nome do cliente deve ser uma string',
              })
              .max(100, 'O nome do cliente deve ter no máximo 100 caracteres')
              .optional(),
            status: z
              .enum(
                [
                  'pending',
                  'canceled',
                  'processing',
                  'delivering',
                  'delivered',
                ],
                {
                  invalid_type_error: 'O status deve ser um valor válido',
                  required_error: 'O status é obrigatório',
                },
              )
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
