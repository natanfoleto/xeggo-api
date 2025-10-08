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
            categoryId: z
              .string({
                required_error: 'O ID da categoria é obrigatório',
                invalid_type_error: 'O ID da categoria deve ser uma string',
              })
              .cuid('O ID da categoria deve ser um CUID válido')
              .max(30, 'O ID da categoria deve ter no máximo 30 caracteres'),
          }),
          body: z.object({
            name: z
              .string({
                invalid_type_error: 'O nome deve ser uma string',
              })
              .min(1, 'O nome deve ter pelo menos 1 caractere')
              .max(50, 'O nome deve ter no máximo 50 caracteres')
              .optional(),
            description: z
              .string({
                invalid_type_error: 'A descrição deve ser uma string',
              })
              .max(300, 'A descrição deve ter no máximo 300 caracteres')
              .optional(),
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
