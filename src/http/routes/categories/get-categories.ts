import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { authenticate } from '@/http/middlewares/authenticate'
import { prisma } from '@/lib/prisma'

export async function getCategories(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(authenticate)
    .get(
      '/restaurants/:restaurantId/categories',
      {
        schema: {
          tags: ['Categorias'],
          summary: 'Listar categorias de um restaurante',
          params: z.object({
            restaurantId: z
              .string({
                required_error: 'O ID do restaurante é obrigatório',
                invalid_type_error: 'O ID do restaurante deve ser uma string',
              })
              .cuid('O ID do restaurante deve ser um CUID válido')
              .max(30, 'O ID do restaurante deve ter no máximo 30 caracteres'),
          }),
          response: {
            200: z.object({
              categories: z.array(
                z.object({
                  id: z.string().cuid(),
                  name: z.string(),
                  description: z.string().nullable(),
                  restaurantId: z.string(),
                  createdAt: z.date(),
                  updatedAt: z.date(),
                  _count: z.object({
                    products: z.number(),
                  }),
                }),
              ),
            }),
          },
        },
      },
      async (request, reply) => {
        const { restaurantId } = request.params

        const categories = await prisma.category.findMany({
          where: {
            restaurantId,
          },
          include: {
            _count: {
              select: {
                products: true,
              },
            },
          },
          orderBy: {
            name: 'asc',
          },
        })

        return reply.status(200).send({ categories })
      },
    )
}
