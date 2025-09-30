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
            name: z.string(),
            description: z.string().optional().nullable(),
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
