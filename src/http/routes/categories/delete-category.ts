import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { authenticate } from '@/http/middlewares/authenticate'
import { BadRequestError } from '@/http/routes/_errors/bad-request-error'
import { prisma } from '@/lib/prisma'

export async function deleteCategory(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(authenticate)
    .delete(
      '/categories/:categoryId',
      {
        schema: {
          tags: ['Categorias'],
          summary: 'Deletar categoria',
          params: z.object({
            categoryId: z
              .string({
                required_error: 'O ID da categoria é obrigatório',
                invalid_type_error: 'O ID da categoria deve ser uma string',
              })
              .max(30, 'O ID da categoria deve ter no máximo 30 caracteres'),
          }),
          response: {
            204: z.null(),
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

        if (category._count.products > 0) {
          throw new BadRequestError(
            'Não é possível deletar categoria com produtos associados.',
          )
        }

        await prisma.category.delete({
          where: { id: categoryId },
        })

        return reply.status(204).send()
      },
    )
}
