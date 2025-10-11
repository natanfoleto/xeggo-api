import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { authenticate } from '@/http/middlewares/authenticate'
import { prisma } from '@/lib/prisma'

export async function updateAddress(app: FastifyInstance) {
  app
    .register(authenticate)
    .withTypeProvider<ZodTypeProvider>()
    .put(
      '/address',
      {
        schema: {
          tags: ['Endereços'],
          summary: 'Atualiza o endereço do restaurante',
          body: z.object({
            address: z.object({
              zipCode: z
                .string()
                .regex(/^\d{5}-?\d{3}$/, 'CEP inválido')
                .nullable()
                .optional(),
              street: z.string().max(200).nullable().optional(),
              number: z.string().max(20).nullable().optional(),
              complement: z.string().max(100).nullable().optional(),
              neighborhood: z.string().max(100).nullable().optional(),
              city: z.string().max(100).nullable().optional(),
              state: z
                .string()
                .length(2, 'Estado deve ter 2 caracteres')
                .nullable()
                .optional(),
            }),
          }),
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const { restaurantId } = await request.getCurrentUser()

        const { address } = request.body

        await prisma.restaurant.update({
          where: { id: restaurantId },
          data: {
            zipCode: address.zipCode,
            street: address.street,
            number: address.number,
            complement: address.complement,
            neighborhood: address.neighborhood,
            city: address.city,
            state: address.state,
          },
        })

        return reply.status(204).send()
      },
    )
}
