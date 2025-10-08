import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { authenticate } from '@/http/middlewares/authenticate'
import { BadRequestError } from '@/http/routes/_errors/bad-request-error'
import { prisma } from '@/lib/prisma'

export async function getProduct(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(authenticate)
    .get(
      '/products/:productId',
      {
        schema: {
          tags: ['Produtos'],
          summary: 'Buscar produto por ID',
          params: z.object({
            productId: z.string().cuid(),
          }),
          response: {
            200: z.object({
              product: z.object({
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
                  description: z.string().nullable(),
                }),
                ingredients: z.array(
                  z.object({
                    id: z.string().cuid(),
                    name: z.string(),
                    productId: z.string(),
                    createdAt: z.date(),
                    updatedAt: z.date(),
                  }),
                ),
                complementGroups: z.array(
                  z.object({
                    id: z.string().cuid(),
                    name: z.string(),
                    mandatory: z.boolean(),
                    min: z.number(),
                    max: z.number(),
                    productId: z.string(),
                    createdAt: z.date(),
                    updatedAt: z.date(),
                    complements: z.array(
                      z.object({
                        id: z.string().cuid(),
                        name: z.string(),
                        priceInCents: z.number().nullable(),
                        description: z.string().nullable(),
                        complementGroupId: z.string(),
                        createdAt: z.date(),
                        updatedAt: z.date(),
                      }),
                    ),
                  }),
                ),
              }),
            }),
          },
        },
      },
      async (request, reply) => {
        const { productId } = request.params

        const product = await prisma.product.findUnique({
          where: { id: productId },
          include: {
            category: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
            ingredients: true,
            complementGroups: {
              include: {
                complements: true,
              },
            },
          },
        })

        if (!product) {
          throw new BadRequestError('Produto não encontrado.')
        }

        return reply.status(200).send({ product })
      },
    )
}
