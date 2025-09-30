import dayjs from 'dayjs'
import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { authenticate } from '@/http/middlewares/authenticate'
import { prisma } from '@/lib/prisma'

export async function getMonthCanceledOrdersAmount(app: FastifyInstance) {
  app.register(authenticate).get(
    '/metrics/month-canceled-orders-amount',
    {
      schema: {
        tags: ['Metrics'],
        summary:
          'Quantidade de pedidos cancelados no mês atual e variação em relação ao mês anterior',
        response: {
          200: z.object({
            amount: z.number(),
            diffFromLastMonth: z.number(),
          }),
        },
      },
    },
    async (request) => {
      const { restaurantId } = await request.getCurrentUser()

      const today = dayjs()
      const startOfCurrentMonth = today.startOf('month').toDate()
      const startOfNextMonth = dayjs(startOfCurrentMonth)
        .add(1, 'month')
        .toDate()
      const startOfLastMonth = dayjs(startOfCurrentMonth)
        .subtract(1, 'month')
        .toDate()

      const currentMonthAmount = await prisma.order.count({
        where: {
          restaurantId,
          status: 'canceled',
          createdAt: { gte: startOfCurrentMonth, lt: startOfNextMonth },
        },
      })

      const lastMonthAmount = await prisma.order.count({
        where: {
          restaurantId,
          status: 'canceled',
          createdAt: { gte: startOfLastMonth, lt: startOfCurrentMonth },
        },
      })

      const diffFromLastMonth =
        lastMonthAmount > 0
          ? Number(
              ((currentMonthAmount * 100) / lastMonthAmount - 100).toFixed(2),
            )
          : 0

      return {
        amount: currentMonthAmount,
        diffFromLastMonth,
      }
    },
  )
}
