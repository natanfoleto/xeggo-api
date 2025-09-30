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
                  id: z.string().optional(),
                  name: z.string(),
                  description: z.string().optional(),
                  price: z.number().min(0),
                }),
              ),
              deletedProductIds: z.array(z.string()),
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
            }))

            await tx.product.createMany({
              data,
            })
          }
        })

        reply.code(204).send()
      },
    )
}
