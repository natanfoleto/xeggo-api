import dayjs from 'dayjs'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { authenticate } from '@/http/middlewares/authenticate'
import { prisma } from '@/lib/prisma'

export async function getMonthCanceledOrdersAmount(app: FastifyInstance) {
  app
    .register(authenticate)
    .withTypeProvider<ZodTypeProvider>()
    .get(
      '/metrics/month-canceled-orders-amount',
      {
        schema: {
          tags: ['Metrics'],
          summary:
            'Quantidade de pedidos cancelados no mês atual e variação em relação ao mês anterior',
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
