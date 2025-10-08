import dayjs from 'dayjs'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { authenticate } from '@/http/middlewares/authenticate'
import { prisma } from '@/lib/prisma'

export async function getMonthOrdersAmount(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(authenticate)
    .get(
      '/metrics/month-orders-amount',
      {
        schema: {
          tags: ['Métricas'],
          summary: 'Pedidos no mês vs mês anterior',
          response: {
            200: z.object({
              amount: z.number({
                required_error: 'A quantidade é obrigatória',
                invalid_type_error: 'A quantidade deve ser um número',
              }),
              diffFromLastMonth: z.number({
                required_error: 'A diferença do mês anterior é obrigatória',
                invalid_type_error:
                  'A diferença do mês anterior deve ser um número',
              }),
            }),
          },
        },
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
