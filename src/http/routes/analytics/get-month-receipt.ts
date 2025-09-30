import dayjs from 'dayjs'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { authenticate } from '@/http/middlewares/authenticate'
import { prisma } from '@/lib/prisma'

export async function getMonthReceipt(app: FastifyInstance) {
  app
    .register(authenticate)
    .withTypeProvider<ZodTypeProvider>()
    .get(
      '/metrics/month-receipt',
      {
        schema: {
          tags: ['Metrics'],
          summary: 'Receita do mês atual e variação em relação ao mês anterior',
          response: {
            200: z.object({
              receipt: z.number(),
              diffFromLastMonth: z.number(),
            }),
          },
        },
      },
      async (request) => {
        const { restaurantId } = await request.getCurrentUser()

        const today = dayjs()
        const startOfCurrentMonth = today.startOf('month').toDate()
        const startOfLastMonth = dayjs(startOfCurrentMonth)
          .subtract(1, 'month')
          .toDate()
        const startOfNextMonth = dayjs(startOfCurrentMonth)
          .add(1, 'month')
          .toDate()

        const currentOrders = await prisma.orderItem.findMany({
          where: {
            order: {
              restaurantId,
              createdAt: { gte: startOfCurrentMonth, lt: startOfNextMonth },
            },
          },
          select: {
            priceInCents: true,
            quantity: true,
          },
        })

        const lastOrders = await prisma.orderItem.findMany({
          where: {
            order: {
              restaurantId,
              createdAt: { gte: startOfLastMonth, lt: startOfCurrentMonth },
            },
          },
          select: {
            priceInCents: true,
            quantity: true,
          },
        })

        const sumOrders = (
          orders: { priceInCents: number; quantity: number }[],
        ) =>
          orders.reduce(
            (acc, item) => acc + item.priceInCents * item.quantity,
            0,
          )

        const currentReceipt = sumOrders(currentOrders)
        const lastReceipt = sumOrders(lastOrders)

        const diffFromLastMonth =
          lastReceipt > 0
            ? Number(((currentReceipt * 100) / lastReceipt - 100).toFixed(2))
            : 0

        return { receipt: currentReceipt, diffFromLastMonth }
      },
    )
}
