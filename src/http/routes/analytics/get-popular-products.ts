import type { FastifyInstance } from 'fastify'

import { authenticate } from '@/http/middlewares/authenticate'
import { prisma } from '@/lib/prisma'

export async function getPopularProducts(app: FastifyInstance) {
  app.register(authenticate).get(
    '/metrics/popular-products',
    {
      schema: {
        tags: ['Métricas'],
        summary: 'Top 5 produtos por itens vendidos',
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
