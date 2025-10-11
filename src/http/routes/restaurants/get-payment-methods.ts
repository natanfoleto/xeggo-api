import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { authenticate } from '@/http/middlewares/authenticate'
import { prisma } from '@/lib/prisma'

export async function getPaymentMethods(app: FastifyInstance) {
  app
    .register(authenticate)
    .withTypeProvider<ZodTypeProvider>()
    .get(
      '/payment-methods',
      {
        schema: {
          tags: ['Métodos de pagamento'],
          summary: 'Lista os métodos de pagamento do restaurante',
          response: {
            200: z.object({
              paymentMethods: z.array(
                z.enum([
                  'cash',
                  'creditCard',
                  'debitCard',
                  'pix',
                  'voucher',
                  'bankTransfer',
                ]),
              ),
            }),
          },
        },
      },
      async (request, reply) => {
        const { restaurantId } = await request.getCurrentUser()

        const paymentMethodRelations =
          await prisma.restaurantPaymentMethod.findMany({
            where: { restaurantId },
            select: { paymentMethod: true },
          })

        const paymentMethods = paymentMethodRelations.map(
          (relation) => relation.paymentMethod,
        )

        return reply.send({ paymentMethods })
      },
    )
}
