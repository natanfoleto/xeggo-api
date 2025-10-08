import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { authenticate } from '@/http/middlewares/authenticate'
import { BadRequestError } from '@/http/routes/_errors/bad-request-error'
import { prisma } from '@/lib/prisma'

export async function updateCategory(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(authenticate)
    .put(
      '/categories/:categoryId',
      {
        schema: {
          tags: ['Categorias'],
          summary: 'Atualizar categoria',
          params: z.object({
            categoryId: z.string().cuid(),
          }),
          body: z.object({
            name: z.string().min(1).max(100).optional(),
            description: z.string().max(500).optional(),
          }),
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const { categoryId } = request.params
        const { name, description } = request.body

        const currentCategory = await prisma.category.findUnique({
          where: { id: categoryId },
        })

        if (!currentCategory) {
          throw new BadRequestError('Categoria não encontrada.')
        }

        if (name && name !== currentCategory.name) {
          const existingCategory = await prisma.category.findFirst({
            where: {
              restaurantId: currentCategory.restaurantId,
              name,
              id: { not: categoryId },
            },
          })

          if (existingCategory) {
            throw new BadRequestError(
              'Já existe uma categoria com este nome neste restaurante.',
            )
          }
        }

        await prisma.category.update({
          where: { id: categoryId },
          data: {
            name,
            description,
          },
        })

        return reply.status(204).send()
      },
    )
}
