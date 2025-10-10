import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { authenticate } from '@/http/middlewares/authenticate'
import { prisma } from '@/lib/prisma'

const weekDayEnum = z.enum([
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
])

export async function getOpeningHours(app: FastifyInstance) {
  app
    .register(authenticate)
    .withTypeProvider<ZodTypeProvider>()
    .get(
      '/opening-hours',
      {
        schema: {
          tags: ['Horários de funcionamento'],
          summary: 'Lista os horários de funcionamento do restaurante',
          response: {
            200: z.object({
              openingHours: z.array(
                z.object({
                  id: z.string(),
                  weekDay: weekDayEnum,
                  openTime: z.string(),
                  closeTime: z.string(),
                  createdAt: z.date(),
                  updatedAt: z.date(),
                }),
              ),
            }),
          },
        },
      },
      async (request, reply) => {
        const { restaurantId } = await request.getCurrentUser()

        const openingHours = await prisma.openingHour.findMany({
          where: { restaurantId },
          orderBy: [{ weekDay: 'asc' }, { openTime: 'asc' }],
        })

        return reply.send({ openingHours })
      },
    )
}
