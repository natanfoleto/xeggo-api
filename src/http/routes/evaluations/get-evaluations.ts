import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { authenticate } from '@/http/middlewares/authenticate'
import { prisma } from '@/lib/prisma'

export async function getEvaluations(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(authenticate)
    .get(
      '/evaluations',
      {
        schema: {
          tags: ['Avaliações'],
          summary: 'Listar avaliações (admin restaurante)',
          querystring: z.object({
            pageIndex: z.coerce.number().int().min(0).default(0),
          }),
        },
      },
      async (request) => {
        const { restaurantId } = await request.getCurrentUser()

        const pageIndex = request.query.pageIndex

        const evaluations = await prisma.evaluation.findMany({
          where: { restaurantId },
          orderBy: { createdAt: 'desc' },
          take: 10,
          skip: pageIndex * 10,
        })

        return evaluations
      },
    )
}
