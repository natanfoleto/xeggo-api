import dayjs from 'dayjs'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { authenticate } from '@/http/middlewares/authenticate'
import { prisma } from '@/lib/prisma'

export async function getDayOrdersAmount(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(authenticate)
    .get(
      '/metrics/day-orders-amount',
      {
        schema: {
          tags: ['Métricas'],
          summary: 'Pedidos de hoje vs ontem',
          response: {
            200: z.object({
              amount: z.number({
                required_error: 'A quantidade é obrigatória',
                invalid_type_error: 'A quantidade deve ser um número',
              }),
              diffFromYesterday: z.number({
                required_error: 'A diferença de ontem é obrigatória',
                invalid_type_error: 'A diferença de ontem deve ser um número',
              }),
            }),
          },
        },
      },
      async (request) => {
        const { restaurantId } = await request.getCurrentUser()

        const todayStart = dayjs().startOf('day').toDate()
        const yesterdayStart = dayjs()
          .subtract(1, 'day')
          .startOf('day')
          .toDate()

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
