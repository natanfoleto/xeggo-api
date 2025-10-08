import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { authenticate } from '@/http/middlewares/authenticate'
import { prisma } from '@/lib/prisma'

export async function updateMenu(app: FastifyInstance) {
  app
    .register(authenticate)
    .withTypeProvider<ZodTypeProvider>()
    .put(
      '/menu',
      {
        schema: {
          tags: ['Menu'],
          summary: 'Atualiza o menu: deleta, atualiza e cria produtos',
          body: z.object({
            products: z.object({
              newOrUpdatedProducts: z.array(
                z.object({
                  id: z
                    .string({
                      invalid_type_error: 'O ID do produto deve ser uma string',
                    })
                    .cuid('O ID do produto deve ser um CUID válido')
                    .max(30, 'O ID do produto deve ter no máximo 30 caracteres')
                    .optional(),
                  name: z
                    .string({
                      required_error: 'O nome é obrigatório',
                      invalid_type_error: 'O nome deve ser uma string',
                    })
                    .min(1, 'O nome deve ter pelo menos 1 caractere')
                    .max(100, 'O nome deve ter no máximo 100 caracteres'),
                  description: z
                    .string({
                      invalid_type_error: 'A descrição deve ser uma string',
                    })
                    .max(500, 'A descrição deve ter no máximo 500 caracteres')
                    .optional(),
                  price: z
                    .number({
                      required_error: 'O preço é obrigatório',
                      invalid_type_error: 'O preço deve ser um número',
                    })
                    .min(0, 'O preço deve ser no mínimo 0'),
                }),
              ),
              deletedProductIds: z.array(
                z
                  .string({
                    invalid_type_error: 'O ID do produto deve ser uma string',
                  })
                  .cuid('O ID do produto deve ser um CUID válido')
                  .max(30, 'O ID do produto deve ter no máximo 30 caracteres'),
              ),
            }),
          }),
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const { restaurantId } = await request.getCurrentUser()

        const {
          products: { deletedProductIds = [], newOrUpdatedProducts = [] },
        } = request.body

        const deletedIds = Array.isArray(deletedProductIds)
          ? deletedProductIds
          : []
        const incoming = Array.isArray(newOrUpdatedProducts)
          ? newOrUpdatedProducts
          : []

        const updates = incoming.filter((p) => !!p.id)
        const creates = incoming.filter((p) => !p.id)

        await prisma.$transaction(async (tx) => {
          if (deletedIds.length > 0) {
            await tx.product.deleteMany({
              where: {
                id: { in: deletedIds },
                restaurantId,
              },
            })
          }

          if (updates.length > 0) {
            await Promise.all(
              updates.map((product) => {
                const priceInCents = Math.round(Number(product.price) * 100)
                return tx.product.updateMany({
                  where: {
                    id: product.id,
                    restaurantId,
                  },
                  data: {
                    name: product.name,
                    description: product.description ?? null,
                    categoryId: '',
                    priceInCents,
                  },
                })
              }),
            )
          }

          if (creates.length > 0) {
            const data = creates.map((product) => ({
              name: product.name,
              description: product.description ?? null,
              priceInCents: Math.round(Number(product.price) * 100),
              restaurantId,
              categoryId: '',
            }))

            await tx.product.createMany({
              data,
            })
          }
        })

        return reply.status(204).send()
      },
    )
}
