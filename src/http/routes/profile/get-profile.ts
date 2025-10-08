import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { authenticate } from '@/http/middlewares/authenticate'
import { prisma } from '@/lib/prisma'

export async function getProfile(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(authenticate)
    .get(
      '/me',
      {
        schema: {
          tags: ['Perfil'],
          summary: 'Obter perfil do usuário logado',
          response: {
            200: z.object({
              name: z
                .string({
                  required_error: 'O nome é obrigatório',
                  invalid_type_error: 'O nome deve ser uma string',
                })
                .min(1, 'O nome deve ter pelo menos 1 caractere'),
              phone: z.string().nullable(),
              email: z
                .string({
                  required_error: 'O e-mail é obrigatório',
                  invalid_type_error: 'O e-mail deve ser uma string',
                })
                .email('O e-mail deve ser válido'),
              role: z.string(),
            }),
          },
        },
      },
      async (request) => {
        const { userId } = await request.getCurrentUser()

        const user = await prisma.user.findUniqueOrThrow({
          where: { id: userId },
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
          },
        })

        return user
      },
    )
}
