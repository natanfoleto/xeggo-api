import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { authenticate } from '@/http/middlewares/authenticate'
import { prisma } from '@/lib/prisma'

export async function updateProfile(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(authenticate)
    .put(
      '/profile',
      {
        schema: {
          tags: ['Perfil'],
          summary: 'Atualizar dados do restaurante gerenciado',
          body: z.object({
            name: z
              .string({
                required_error: 'O nome é obrigatório',
                invalid_type_error: 'O nome deve ser uma string',
              })
              .min(1, 'O nome deve ter pelo menos 1 caractere')
              .max(100, 'O nome deve ter no máximo 100 caracteres'),
            description: z
              .string({
                invalid_type_error: 'A descrição deve ser uma string',
              })
              .max(500, 'A descrição deve ter no máximo 500 caracteres')
              .optional()
              .nullable(),
          }),
        },
      },
      async (request, reply) => {
        const { restaurantId } = await request.getCurrentUser()

        const { name, description } = request.body

        await prisma.restaurant.update({
          where: { id: restaurantId },
          data: { name, description: description ?? null },
        })

        return reply.status(204).send()
      },
    )
}
