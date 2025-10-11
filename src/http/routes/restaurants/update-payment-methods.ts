import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { authenticate } from '@/http/middlewares/authenticate'
import { prisma } from '@/lib/prisma'

export async function updatePaymentMethods(app: FastifyInstance) {
  app
    .register(authenticate)
    .withTypeProvider<ZodTypeProvider>()
    .put(
      '/payment-methods',
      {
        schema: {
          tags: ['Métodos de pagamento'],
          summary: 'Atualiza os métodos de pagamento do restaurante',
          body: z.object({
            paymentMethods: z.object({
              selectedMethods: z.array(
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
          }),
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const { restaurantId } = await request.getCurrentUser()

        const {
          paymentMethods: { selectedMethods },
        } = request.body

        await prisma.$transaction(async (tx) => {
          await tx.restaurantPaymentMethod.deleteMany({
            where: {
              restaurantId,
            },
          })

          if (selectedMethods.length > 0) {
            await tx.restaurantPaymentMethod.createMany({
              data: selectedMethods.map((paymentMethod) => ({
                restaurantId,
                paymentMethod,
              })),
            })
          }
        })

        return reply.status(204).send()
      },
    )
}
