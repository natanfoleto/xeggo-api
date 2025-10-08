import type { Prisma } from '@prisma/client'
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
      '/products',
      {
        schema: {
          tags: ['Produtos'],
          summary: 'Listar produtos de um restaurante',
          querystring: z.object({
            pageIndex: z.coerce
              .number({
                invalid_type_error: 'O índice da página deve ser um número',
              })
              .int('O índice da página deve ser um número inteiro')
              .min(0, 'O índice da página deve ser no mínimo 0')
              .default(0),
            productName: z
              .string({
                invalid_type_error: 'O nome do produto deve ser uma string',
              })
              .max(100, 'O nome do produto deve ter no máximo 100 caracteres')
              .optional(),
            categoryId: z
              .string({
                invalid_type_error: 'O ID da categoria deve ser uma string',
              })
              .max(30, 'O ID da categoria deve ter no máximo 30 caracteres')
              .optional(),
            active: z
              .enum(['true', 'false'], {
                invalid_type_error: 'O status deve ser true ou false',
              })
              .transform((val) => val === 'true')
              .optional(),
          }),
          response: {
            200: z.object({
              products: z.array(
                z.object({
                  id: z.string(),
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
                    id: z.string(),
                    name: z.string(),
                  }),
                }),
              ),
              meta: z.object({
                pageIndex: z.number().int(),
                totalCount: z.number().int(),
                perPage: z.number().int(),
              }),
            }),
          },
        },
      },
      async (request, reply) => {
        const { restaurantId } = await request.getCurrentUser()

        const { pageIndex, productName, categoryId, active } = request.query

        const where: Prisma.ProductWhereInput = { restaurantId }

        if (productName) {
          where.name = { contains: productName, mode: 'insensitive' }
        }

        if (categoryId) {
          where.categoryId = categoryId
        }

        if (active !== undefined) {
          where.active = active
        }

        const perPage = 10

        const [products, totalCount] = await Promise.all([
          prisma.product.findMany({
            where,
            orderBy: { name: 'asc' },
            take: perPage,
            skip: pageIndex * perPage,
            include: {
              category: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          }),
          prisma.product.count({ where }),
        ])

        return reply.status(200).send({
          products,
          meta: {
            pageIndex,
            totalCount,
            perPage,
          },
        })
      },
    )
}
