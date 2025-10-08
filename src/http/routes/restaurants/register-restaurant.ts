import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { BadRequestError } from '@/http/routes/_errors/bad-request-error'
import { prisma } from '@/lib/prisma'

export async function registerRestaurant(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/restaurants',
    {
      schema: {
        tags: ['Restaurantes'],
        summary: 'Cadastrar restaurante + gerente',
        body: z.object({
          restaurantName: z
            .string({
              required_error: 'O nome do restaurante é obrigatório',
              invalid_type_error: 'O nome do restaurante deve ser uma string',
            })
            .min(1, 'O nome do restaurante deve ter pelo menos 1 caractere')
            .max(
              100,
              'O nome do restaurante deve ter no máximo 100 caracteres',
            ),
          managerName: z
            .string({
              required_error: 'O nome do gerente é obrigatório',
              invalid_type_error: 'O nome do gerente deve ser uma string',
            })
            .min(1, 'O nome do gerente deve ter pelo menos 1 caractere')
            .max(100, 'O nome do gerente deve ter no máximo 100 caracteres'),
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
      },
    },
    async (request, reply) => {
      const { restaurantName, managerName, email, phone } = request.body

      const exists = await prisma.user.findUnique({ where: { email } })

      if (exists) throw new BadRequestError('E-mail já cadastrado.')

      const manager = await prisma.user.create({
        data: { name: managerName, email, phone, role: 'manager' },
      })

      await prisma.restaurant.create({
        data: {
          name: restaurantName,
          managerId: manager.id,
        },
      })

      return reply.status(204).send()
    },
  )
}
