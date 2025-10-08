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
          name: z
            .string({
              required_error: 'O nome é obrigatório',
              invalid_type_error: 'O nome deve ser uma string',
            })
            .min(1, 'O nome deve ter pelo menos 1 caractere')
            .max(100, 'O nome deve ter no máximo 100 caracteres'),
          phone: z
            .string({
              required_error: 'O telefone é obrigatório',
              invalid_type_error: 'O telefone deve ser uma string',
            })
            .max(20, 'O telefone deve ter no máximo 20 caracteres'),
          email: z
            .string({
              required_error: 'O e-mail é obrigatório',
              invalid_type_error: 'O e-mail deve ser uma string',
            })
            .email('O e-mail deve ser válido')
            .max(255, 'O e-mail deve ter no máximo 255 caracteres'),
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
