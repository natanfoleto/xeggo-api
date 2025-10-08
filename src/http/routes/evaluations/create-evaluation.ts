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
            restaurantId: z
              .string({
                required_error: 'O ID do restaurante é obrigatório',
                invalid_type_error: 'O ID do restaurante deve ser uma string',
              })
              .max(30, 'O ID do restaurante deve ter no máximo 30 caracteres'),
            rate: z
              .number({
                required_error: 'A avaliação é obrigatória',
                invalid_type_error: 'A avaliação deve ser um número',
              })
              .int('A avaliação deve ser um número inteiro')
              .min(1, 'A avaliação deve ser no mínimo 1')
              .max(5, 'A avaliação deve ser no máximo 5'),
            comment: z
              .string({
                invalid_type_error: 'O comentário deve ser uma string',
              })
              .max(1000, 'O comentário deve ter no máximo 1000 caracteres')
              .optional(),
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
