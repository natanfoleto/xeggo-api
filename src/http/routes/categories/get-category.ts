import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { authenticate } from '@/http/middlewares/authenticate'
import { BadRequestError } from '@/http/routes/_errors/bad-request-error'
import { prisma } from '@/lib/prisma'

export async function getCategory(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(authenticate)
    .get(
      '/categories/:categoryId',
      {
        schema: {
          tags: ['Categorias'],
          summary: 'Buscar categoria por ID',
          params: z.object({
            categoryId: z
              .string({
                required_error: 'O ID da categoria é obrigatório',
                invalid_type_error: 'O ID da categoria deve ser uma string',
              })
              .max(30, 'O ID da categoria deve ter no máximo 30 caracteres'),
          }),
          response: {
            200: z.object({
              category: z.object({
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
            }),
          },
        },
      },
      async (request, reply) => {
        const { categoryId } = request.params

        const category = await prisma.category.findUnique({
          where: { id: categoryId },
          include: {
            _count: {
              select: {
                products: true,
              },
            },
          },
        })

        if (!category) {
          throw new BadRequestError('Categoria não encontrada.')
        }

        return reply.status(200).send({ category })
      },
    )
}
