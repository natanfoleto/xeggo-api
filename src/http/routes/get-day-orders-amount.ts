import dayjs from 'dayjs'
import type { FastifyInstance } from 'fastify'

import { authenticate } from '@/http/middlewares/authenticate'
import { prisma } from '@/lib/prisma'

export async function getDayOrdersAmount(app: FastifyInstance) {
  app.register(authenticate).get(
    '/metrics/day-orders-amount',
    {
      schema: {
        tags: ['Métricas'],
        summary: 'Pedidos de hoje vs ontem',
      },
    },
    async (request) => {
      const { restaurantId } = await request.getCurrentUser()

      const todayStart = dayjs().startOf('day').toDate()
      const yesterdayStart = dayjs().subtract(1, 'day').startOf('day').toDate()

      const [todayAmount, yesterdayAmount] = await Promise.all([
        prisma.order.count({
          where: { restaurantId, createdAt: { gte: todayStart } },
        }),
        prisma.order.count({
          where: {
            restaurantId,
            createdAt: { gte: yesterdayStart, lt: todayStart },
          },
        }),
      ])

      const diffFromYesterday =
        yesterdayAmount > 0
          ? Number(((todayAmount * 100) / yesterdayAmount - 100).toFixed(2))
          : 0

      return { amount: todayAmount, diffFromYesterday }
    },
  )
}
