import dayjs from 'dayjs'
import type { FastifyInstance } from 'fastify'

import { authenticate } from '@/http/middlewares/authenticate'
import { prisma } from '@/lib/prisma'

export async function getMonthOrdersAmount(app: FastifyInstance) {
  app.register(authenticate).get(
    '/metrics/month-orders-amount',
    {
      schema: { tags: ['Métricas'], summary: 'Pedidos no mês vs mês anterior' },
    },
    async (request) => {
      const { restaurantId } = await request.getCurrentUser()

      const startOfThisMonth = dayjs().startOf('month').toDate()
      const startOfLastMonth = dayjs()
        .subtract(1, 'month')
        .startOf('month')
        .toDate()

      const [thisMonth, lastMonth] = await Promise.all([
        prisma.order.count({
          where: { restaurantId, createdAt: { gte: startOfThisMonth } },
        }),
        prisma.order.count({
          where: {
            restaurantId,
            createdAt: { gte: startOfLastMonth, lt: startOfThisMonth },
          },
        }),
      ])

      const diffFromLastMonth =
        lastMonth > 0
          ? Number(((thisMonth * 100) / lastMonth - 100).toFixed(2))
          : 0

      return { amount: thisMonth, diffFromLastMonth }
    },
  )
}
