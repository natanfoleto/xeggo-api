import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { authenticate } from '@/http/middlewares/authenticate'
import { BadRequestError } from '@/http/routes/_errors/bad-request-error'
import { prisma } from '@/lib/prisma'

export async function createProduct(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(authenticate)
    .post(
      '/restaurants/:restaurantId/products',
      {
        schema: {
          tags: ['Produtos'],
          summary: 'Criar produto',
          params: z.object({
            restaurantId: z.string().cuid(),
          }),
          body: z.object({
            name: z.string().min(1).max(100),
            description: z.string().max(500).optional(),
            priceInCents: z.number().int().positive(),
            categoryId: z.string().cuid(),
            active: z.boolean().default(true),
          }),
          response: {
            201: z.object({
              productId: z.string().cuid(),
            }),
          },
        },
      },
      async (request, reply) => {
        const { restaurantId } = request.params
        const { name, description, priceInCents, categoryId, active } =
          request.body

        // Verificar se a categoria existe e pertence ao restaurante
        const category = await prisma.category.findUnique({
          where: { id: categoryId },
        })

        if (!category) {
          throw new BadRequestError('Categoria não encontrada.')
        }

        if (category.restaurantId !== restaurantId) {
          throw new BadRequestError(
            'Esta categoria não pertence a este restaurante.',
          )
        }

        const product = await prisma.product.create({
          data: {
            name,
            description,
            priceInCents,
            categoryId,
            active,
            restaurantId,
          },
          select: { id: true },
        })

        return reply.status(201).send({
          productId: product.id,
        })
      },
    )
}
