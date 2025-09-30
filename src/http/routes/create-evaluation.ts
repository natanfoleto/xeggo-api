import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { authenticate } from '@/http/middlewares/authenticate'
import { prisma } from '@/lib/prisma'

export async function createEvaluation(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(authenticate)
    .post(
      '/evaluations',
      {
        schema: {
          tags: ['Avaliações'],
          summary: 'Criar avaliação de restaurante',
          body: z.object({
            restaurantId: z.string(),
            rate: z.number().int().min(1).max(5),
            comment: z.string().optional(),
          }),
        },
      },
      async (request, reply) => {
        const { userId } = await request.getCurrentUser()

        const { restaurantId, rate, comment } = request.body

        await prisma.evaluation.create({
          data: { customerId: userId, restaurantId, rate, comment },
        })

        return reply.status(201).send()
      },
    )
}
