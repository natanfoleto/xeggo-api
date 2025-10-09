import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { authenticate } from '@/http/middlewares/authenticate'
import { prisma } from '@/lib/prisma'

export async function getCategories(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(authenticate)
    .get(
      '/categories',
      {
        schema: {
          tags: ['Categorias'],
          summary: 'Listar categorias de um restaurante',
          querystring: z.object({
            pageIndex: z.coerce
              .number({
                invalid_type_error: 'O índice da página deve ser um número',
              })
              .int('O índice da página deve ser um número inteiro')
              .min(0, 'O índice da página deve ser no mínimo 0')
              .default(0),
          }),
          response: {
            200: z.object({
              categories: z.array(
                z.object({
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

        const { pageIndex } = request.query

        const perPage = 10

        const [categories, totalCount] = await Promise.all([
          prisma.category.findMany({
            where: {
              restaurantId,
            },
            include: {
              _count: {
                select: {
                  products: true,
                },
              },
            },
            orderBy: {
              name: 'asc',
            },
            take: perPage,
            skip: pageIndex * perPage,
          }),
          prisma.category.count({
            where: {
              restaurantId,
            },
          }),
        ])

        return reply.send({
          categories,
          meta: {
            pageIndex,
            totalCount,
            perPage,
          },
        })
      },
    )
}
