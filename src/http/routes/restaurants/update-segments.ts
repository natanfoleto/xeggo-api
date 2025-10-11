import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { authenticate } from '@/http/middlewares/authenticate'
import { prisma } from '@/lib/prisma'

export async function updateSegments(app: FastifyInstance) {
  app
    .register(authenticate)
    .withTypeProvider<ZodTypeProvider>()
    .put(
      '/segments',
      {
        schema: {
          tags: ['Segmentos'],
          summary: 'Atualiza os segmentos do restaurante',
          body: z.object({
            segments: z.object({
              selectedSegments: z.array(
                z.enum([
                  'restaurant',
                  'bakery',
                  'snackBar',
                  'pizzeria',
                  'iceCreamShop',
                  'coffee',
                  'fastFood',
                  'barbecue',
                  'japanese',
                  'brazilian',
                  'italian',
                  'chinese',
                  'mexican',
                  'arabic',
                  'bar',
                ]),
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
          segments: { selectedSegments },
        } = request.body

        await prisma.$transaction(async (tx) => {
          await tx.restaurantSegment.deleteMany({
            where: {
              restaurantId,
            },
          })

          if (selectedSegments.length > 0) {
            await tx.restaurantSegment.createMany({
              data: selectedSegments.map((segment) => ({
                restaurantId,
                segment,
              })),
            })
          }
        })

        return reply.status(204).send()
      },
    )
}
