import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { authenticate } from '@/http/middlewares/authenticate'
import { prisma } from '@/lib/prisma'

export async function getPopularProducts(app: FastifyInstance) {
  app
    .register(authenticate)
    .withTypeProvider<ZodTypeProvider>()
    .get(
      '/metrics/popular-products',
      {
        schema: {
          tags: ['Métricas'],
          summary: 'Top 5 produtos por itens vendidos',
          response: {
            200: z.array(
              z.object({
                product: z.string({
                  required_error: 'O nome do produto é obrigatório',
                  invalid_type_error: 'O nome do produto deve ser uma string',
                }),
                amount: z.number({
                  required_error: 'A quantidade é obrigatória',
                  invalid_type_error: 'A quantidade deve ser um número',
                }),
              }),
            ),
          },
        },
      },
      async (request) => {
        const { restaurantId } = await request.getCurrentUser()

        const rows = await prisma.orderItem.groupBy({
          by: ['productId'],
          where: { order: { restaurantId } },
          _count: { productId: true },
          orderBy: { _count: { productId: 'desc' } },
          take: 5,
        })

        const products = await prisma.product.findMany({
          where: { id: { in: rows.map((r) => r.productId!).filter(Boolean) } },
          select: { id: true, name: true },
        })

        const nameById: Record<string, string> = Object.fromEntries(
          products.map((p) => [p.id, p.name]),
        )

        return rows.map((r) => ({
          product: r.productId
            ? (nameById[r.productId] ?? 'Produto removido')
            : 'Produto removido',
          amount: r._count.productId,
        }))
      },
    )
}
