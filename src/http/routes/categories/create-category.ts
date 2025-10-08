import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { authenticate } from '@/http/middlewares/authenticate'
import { BadRequestError } from '@/http/routes/_errors/bad-request-error'
import { prisma } from '@/lib/prisma'

export async function createCategory(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(authenticate)
    .post(
      '/categories',
      {
        schema: {
          tags: ['Categorias'],
          summary: 'Criar categoria',
          body: z.object({
            name: z
              .string({
                required_error: 'O nome é obrigatório',
                invalid_type_error: 'O nome deve ser uma string',
              })
              .min(1, 'O nome deve ter pelo menos 1 caractere')
              .max(50, 'O nome deve ter no máximo 50 caracteres'),
            description: z
              .string({
                invalid_type_error: 'A descrição deve ser uma string',
              })
              .max(300, 'A descrição deve ter no máximo 300 caracteres')
              .optional(),
          }),
          response: {
            201: z.object({
              categoryId: z.string().cuid(),
            }),
          },
        },
      },
      async (request, reply) => {
        const { restaurantId } = await request.getCurrentUser()

        const { name, description } = request.body

        const existingCategory = await prisma.category.findFirst({
          where: {
            restaurantId,
            name,
          },
        })

        if (existingCategory) {
          throw new BadRequestError(
            'Já existe uma categoria com este nome neste restaurante.',
          )
        }

        const category = await prisma.category.create({
          data: {
            name,
            description,
            restaurantId,
          },
          select: { id: true },
        })

        return reply.status(201).send({
          categoryId: category.id,
        })
      },
    )
}
