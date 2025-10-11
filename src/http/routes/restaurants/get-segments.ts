import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { authenticate } from '@/http/middlewares/authenticate'
import { prisma } from '@/lib/prisma'

export async function getSegments(app: FastifyInstance) {
  app
    .register(authenticate)
    .withTypeProvider<ZodTypeProvider>()
    .get(
      '/segments',
      {
        schema: {
          tags: ['Segmentos'],
          summary: 'Lista os segmentos do restaurante',
          response: {
            200: z.object({
              segments: z.array(
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
          },
        },
      },
      async (request, reply) => {
        const { restaurantId } = await request.getCurrentUser()

        const segmentRelations = await prisma.restaurantSegment.findMany({
          where: { restaurantId },
          select: { segment: true },
        })

        const segments = segmentRelations.map((relation) => relation.segment)

        return reply.send({ segments })
      },
    )
}
