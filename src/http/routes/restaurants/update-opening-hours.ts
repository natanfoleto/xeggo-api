import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { authenticate } from '@/http/middlewares/authenticate'
import { BadRequestError } from '@/http/routes/_errors/bad-request-error'
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

export async function updateOpeningHours(app: FastifyInstance) {
  app
    .register(authenticate)
    .withTypeProvider<ZodTypeProvider>()
    .put(
      '/opening-hours',
      {
        schema: {
          tags: ['Horários de funcionamento'],
          summary: 'Atualiza os horários de funcionamento do restaurante',
          body: z.object({
            openingHours: z.object({
              newOrUpdatedHours: z.array(
                z.object({
                  id: z
                    .string({
                      invalid_type_error: 'O ID do horário deve ser uma string',
                    })
                    .max(30, 'O ID do horário deve ter no máximo 30 caracteres')
                    .optional(),
                  weekDay: weekDayEnum.refine(
                    (val) => val !== undefined,
                    'O dia da semana é obrigatório',
                  ),
                  openTime: z
                    .string({
                      required_error: 'O horário de abertura é obrigatório',
                      invalid_type_error:
                        'O horário de abertura deve ser uma string',
                    })
                    .regex(
                      /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/,
                      'O horário de abertura deve estar no formato HH:MM',
                    ),
                  closeTime: z
                    .string({
                      required_error: 'O horário de fechamento é obrigatório',
                      invalid_type_error:
                        'O horário de fechamento deve ser uma string',
                    })
                    .regex(
                      /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/,
                      'O horário de fechamento deve estar no formato HH:MM',
                    ),
                }),
              ),
              deletedHourIds: z.array(
                z
                  .string({
                    invalid_type_error: 'O ID do horário deve ser uma string',
                  })
                  .max(30, 'O ID do horário deve ter no máximo 30 caracteres'),
              ),
            }),
          }),
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const { restaurantId } = await request.getCurrentUser()

        const {
          openingHours: { deletedHourIds = [], newOrUpdatedHours = [] },
        } = request.body

        const deletedIds = Array.isArray(deletedHourIds) ? deletedHourIds : []
        const incoming = Array.isArray(newOrUpdatedHours)
          ? newOrUpdatedHours
          : []

        const updates = incoming.filter((h) => !!h.id)
        const creates = incoming.filter((h) => !h.id)

        for (const hour of incoming) {
          if (hour.openTime >= hour.closeTime) {
            throw new BadRequestError(
              'O horário de fechamento deve ser maior que o horário de abertura.',
            )
          }
        }

        await prisma.$transaction(async (tx) => {
          if (deletedIds.length > 0) {
            await tx.openingHour.deleteMany({
              where: {
                id: { in: deletedIds },
                restaurantId,
              },
            })
          }

          if (updates.length > 0) {
            await Promise.all(
              updates.map((hour) =>
                tx.openingHour.updateMany({
                  where: {
                    id: hour.id,
                    restaurantId,
                  },
                  data: {
                    weekDay: hour.weekDay,
                    openTime: hour.openTime,
                    closeTime: hour.closeTime,
                  },
                }),
              ),
            )
          }

          if (creates.length > 0) {
            const data = creates.map((hour) => ({
              weekDay: hour.weekDay,
              openTime: hour.openTime,
              closeTime: hour.closeTime,
              restaurantId,
            }))

            await tx.openingHour.createMany({
              data,
            })
          }
        })

        return reply.status(204).send()
      },
    )
}
