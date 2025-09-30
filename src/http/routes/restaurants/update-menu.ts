import type { FastifyInstance } from 'fastify'

import { authenticate } from '@/http/middlewares/authenticate'
import { prisma } from '@/lib/prisma'

export async function updateMenu(app: FastifyInstance) {
  app.register(authenticate).put(
    '/menu',
    {
      schema: {
        tags: ['Menu'],
        summary: 'Atualiza o menu: deleta, atualiza e cria produtos',
        body: {
          type: 'object',
          properties: {
            products: {
              type: 'object',
              properties: {
                newOrUpdatedProducts: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      name: { type: 'string' },
                      description: { type: 'string' },
                      price: { type: 'number', minimum: 0 },
                    },
                    required: ['name', 'price'],
                    additionalProperties: false,
                  },
                },
                deletedProductIds: {
                  type: 'array',
                  items: { type: 'string' },
                },
              },
              required: ['newOrUpdatedProducts', 'deletedProductIds'],
            },
          },
          required: ['products'],
        },
        response: {
          204: { type: 'null' },
        },
      },
    },
    async (request, reply) => {
      const restaurantId = await request.getManagedRestaurantId()
      const body = request.body as any

      const {
        products: { deletedProductIds = [], newOrUpdatedProducts = [] } = {},
      } = body

      // Normalize arrays
      const deletedIds = Array.isArray(deletedProductIds)
        ? deletedProductIds
        : []
      const incoming = Array.isArray(newOrUpdatedProducts)
        ? newOrUpdatedProducts
        : []

      // Split incoming items into updates (have id) and creates (no id)
      const updates = incoming.filter((p: any) => !!p.id)
      const creates = incoming.filter((p: any) => !p.id)

      await prisma.$transaction(async (tx) => {
        // Deletes
        if (deletedIds.length > 0) {
          await tx.product.deleteMany({
            where: {
              id: { in: deletedIds },
              restaurantId,
            },
          })
        }

        // Updates — usamos updateMany pra garantir o restaurantId na cláusula where
        if (updates.length > 0) {
          await Promise.all(
            updates.map((product: any) => {
              const priceInCents = Math.round(Number(product.price) * 100)
              return tx.product.updateMany({
                where: {
                  id: product.id,
                  restaurantId,
                },
                data: {
                  name: product.name,
                  description: product.description ?? null,
                  // Ajuste o nome do campo se seu schema usar outro (ex.: price, price_in_cents)
                  priceInCents,
                },
              })
            }),
          )
        }

        // Creates — createMany para inserir em lote
        if (creates.length > 0) {
          const data = creates.map((product: any) => ({
            name: product.name,
            description: product.description ?? null,
            priceInCents: Math.round(Number(product.price) * 100),
            restaurantId,
          }))

          // createMany ignora validações/relacionamentos complexos, mas é rápido; se precisar de hooks, use create em loop
          await tx.product.createMany({
            data,
          })
        }
      })

      reply.code(204).send()
    },
  )
}
