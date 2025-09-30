import dayjs from 'dayjs'
import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { authenticate } from '@/http/middlewares/authenticate'
import { prisma } from '@/lib/prisma'

const dailyReceiptQuerySchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
})

const dailyReceiptResponseSchema = z.array(
  z.object({
    date: z.string(), // "DD/MM"
    receipt: z.number(),
  }),
)

export async function getDailyReceiptInPeriod(app: FastifyInstance) {
  app.register(authenticate).get(
    '/metrics/daily-receipt-in-period',
    {
      schema: {
        tags: ['Metrics'],
        summary: 'Receita diária em um período de até 7 dias',
        querystring: dailyReceiptQuerySchema,
        response: {
          200: dailyReceiptResponseSchema,
          400: z.object({
            code: z.string(),
            message: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { restaurantId } = await request.getCurrentUser()

      const query = dailyReceiptQuerySchema.parse(request.query)

      const { from, to } = query

      const startDate = from ? dayjs(from) : dayjs().subtract(7, 'day')
      const endDate = to ? dayjs(to) : from ? startDate.add(7, 'day') : dayjs()

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
