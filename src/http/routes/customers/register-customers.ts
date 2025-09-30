import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { prisma } from '@/lib/prisma'

export async function registerCustomer(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/customers',
    {
      schema: {
        tags: ['Customers'],
        summary: 'Registrar um novo cliente',
        body: z.object({
          name: z.string().min(1),
          phone: z.string(),
          email: z.string().email(),
        }),
        response: {
          201: {
            body: z.object({
              id: z.string(),
              name: z.string(),
              phone: z.string(),
              email: z.string(),
            }),
          },
          409: {
            body: z.object({
              message: z.string(),
            }),
          },
        },
      },
    },
    async (request, reply) => {
      const { name, phone, email } = request.body

      const customer = await prisma.user.create({
        data: {
          name,
          phone,
          email,
        },
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
        },
      })

      reply.code(201).send(customer)
    },
  )
}
