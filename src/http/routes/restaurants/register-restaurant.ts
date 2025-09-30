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
          restaurantName: z.string(),
          managerName: z.string(),
          phone: z.string(),
          email: z.string().email(),
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
