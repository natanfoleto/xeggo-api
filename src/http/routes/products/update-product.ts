import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { authenticate } from '@/http/middlewares/authenticate'
import { BadRequestError } from '@/http/routes/_errors/bad-request-error'
import { prisma } from '@/lib/prisma'

export async function updateProduct(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(authenticate)
    .put(
      '/products/:productId',
      {
        schema: {
          tags: ['Produtos'],
          summary: 'Atualizar produto',
          params: z.object({
            productId: z.string().cuid(),
          }),
          body: z.object({
            name: z.string().min(1).max(100).optional(),
            description: z.string().max(500).optional(),
            priceInCents: z.number().int().positive().optional(),
            categoryId: z.string().cuid().optional(),
            active: z.boolean().optional(),
          }),
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const { productId } = request.params
        const { name, description, priceInCents, categoryId, active } =
          request.body

        const currentProduct = await prisma.product.findUnique({
          where: { id: productId },
        })

        if (!currentProduct) {
          throw new BadRequestError('Produto não encontrado.')
        }

        // Se está mudando a categoria, validar
        if (categoryId && categoryId !== currentProduct.categoryId) {
          const category = await prisma.category.findUnique({
            where: { id: categoryId },
          })

          if (!category) {
            throw new BadRequestError('Categoria não encontrada.')
          }

          if (category.restaurantId !== currentProduct.restaurantId) {
            throw new BadRequestError(
              'Esta categoria não pertence ao restaurante do produto.',
            )
          }
        }

        await prisma.product.update({
          where: { id: productId },
          data: {
            name,
            description,
            priceInCents,
            categoryId,
            active,
          },
        })

        return reply.status(204).send()
      },
    )
}
