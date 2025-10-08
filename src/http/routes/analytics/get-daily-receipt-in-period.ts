import dayjs from 'dayjs'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { authenticate } from '@/http/middlewares/authenticate'
import { prisma } from '@/lib/prisma'

export async function getDailyReceiptInPeriod(app: FastifyInstance) {
  app
    .register(authenticate)
    .withTypeProvider<ZodTypeProvider>()
    .get(
      '/metrics/daily-receipt-in-period',
      {
        schema: {
          tags: ['Metrics'],
          summary: 'Receita diária em um período de até 7 dias',
          querystring: z.object({
            from: z
              .string({
                required_error: 'A data inicial é obrigatória',
                invalid_type_error: 'A data inicial deve ser uma string',
              })
              .datetime({
                message: 'A data inicial deve estar no formato ISO 8601',
              })
              .optional(),
            to: z
              .string({
                required_error: 'A data final é obrigatória',
                invalid_type_error: 'A data final deve ser uma string',
              })
              .datetime({
                message: 'A data final deve estar no formato ISO 8601',
              })
              .optional(),
          }),
          response: {
            200: z.array(
              z.object({
                date: z.string(),
                receipt: z.number(),
              }),
            ),
            400: z.object({
              code: z.string(),
              message: z.string(),
            }),
          },
        },
      },
      async (request, reply) => {
        const { restaurantId } = await request.getCurrentUser()

        const { from, to } = request.query

        const startDate = from ? dayjs(from) : dayjs().subtract(7, 'day')
        const endDate = to
          ? dayjs(to)
          : from
            ? startDate.add(7, 'day')
            : dayjs()

        if (endDate.diff(startDate, 'day') > 7) {
          return reply.status(400).send({
            code: 'INVALID_PERIOD',
            message: 'O intervalo das datas não pode ser superior a 7 dias.',
          })
        }

        const orders = await prisma.order.findMany({
          where: {
            restaurantId,
            createdAt: {
              gte: startDate.startOf('day').toDate(),
              lte: endDate.endOf('day').toDate(),
            },
          },
          select: {
            createdAt: true,
            orderItems: {
              select: {
                priceInCents: true,
                quantity: true,
              },
            },
          },
        })

        const receiptMap = new Map<string, number>()

        orders.forEach((order) => {
          const dateKey = dayjs(order.createdAt).format('DD/MM')
          const orderTotal = order.orderItems.reduce(
            (acc, item) => acc + item.priceInCents * item.quantity,
            0,
          )
          receiptMap.set(dateKey, (receiptMap.get(dateKey) ?? 0) + orderTotal)
        })

        const receiptArray = Array.from(receiptMap.entries()).map(
          ([date, receipt]) => ({ date, receipt }),
        )

        receiptArray.sort((a, b) => {
          const [dayA, monthA] = a.date.split('/').map(Number)
          const [dayB, monthB] = b.date.split('/').map(Number)
          return monthA === monthB ? dayA - dayB : monthA - monthB
        })

        return receiptArray
      },
    )
}
