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
      '/restaurants/:restaurantId/categories',
      {
        schema: {
          tags: ['Categorias'],
          summary: 'Criar categoria',
          params: z.object({
            restaurantId: z.string(),
          }),
          body: z.object({
            name: z.string().min(1).max(100),
            description: z.string().max(500).optional(),
          }),
          response: {
            201: z.object({
              categoryId: z.string().cuid(),
            }),
          },
        },
      },
      async (request, reply) => {
        const { restaurantId } = request.params
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
