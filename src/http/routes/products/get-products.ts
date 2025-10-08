import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { authenticate } from '@/http/middlewares/authenticate'
import { prisma } from '@/lib/prisma'

export async function getProducts(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(authenticate)
    .get(
      '/restaurants/:restaurantId/products',
      {
        schema: {
          tags: ['Produtos'],
          summary: 'Listar produtos de um restaurante',
          params: z.object({
            restaurantId: z
              .string({
                required_error: 'O ID do restaurante é obrigatório',
                invalid_type_error: 'O ID do restaurante deve ser uma string',
              })
              .cuid('O ID do restaurante deve ser um CUID válido')
              .max(30, 'O ID do restaurante deve ter no máximo 30 caracteres'),
          }),
          querystring: z.object({
            categoryId: z
              .string({
                invalid_type_error: 'O ID da categoria deve ser uma string',
              })
              .cuid('O ID da categoria deve ser um CUID válido')
              .max(30, 'O ID da categoria deve ter no máximo 30 caracteres')
              .optional(),
          }),
          response: {
            200: z.object({
              products: z.array(
                z.object({
                  id: z.string().cuid(),
                  name: z.string(),
                  description: z.string().nullable(),
                  priceInCents: z.number(),
                  photoUrl: z.string().nullable(),
                  active: z.boolean(),
                  categoryId: z.string(),
                  restaurantId: z.string(),
                  createdAt: z.date(),
                  updatedAt: z.date(),
                  category: z.object({
                    id: z.string().cuid(),
                    name: z.string(),
                  }),
                }),
              ),
            }),
          },
        },
      },
      async (request, reply) => {
        const { restaurantId } = request.params
        const { categoryId } = request.query

        const products = await prisma.product.findMany({
          where: {
            restaurantId,
            ...(categoryId && { categoryId }),
          },
          include: {
            category: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            name: 'asc',
          },
        })

        return reply.status(200).send({ products })
      },
    )
}
