import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { prisma } from '@/lib/prisma'

const registerCustomerBodySchema = z.object({
  name: z.string().min(1),
  phone: z.string(),
  email: z.string().email(),
})

export async function registerCustomer(app: FastifyInstance) {
  app.post(
    '/customers',
    {
      schema: {
        tags: ['Customers'],
        summary: 'Registrar um novo cliente',
        body: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            phone: { type: 'string' },
            email: { type: 'string', format: 'email' },
          },
          required: ['name', 'phone', 'email'],
        },
        response: {
          201: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              phone: { type: 'string' },
              email: { type: 'string' },
            },
          },
          409: {
            type: 'object',
            properties: { message: { type: 'string' } },
          },
        },
      },
    },
    async (request, reply) => {
      const body = request.body as unknown

      const { name, phone, email } = registerCustomerBodySchema.parse(body)

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
