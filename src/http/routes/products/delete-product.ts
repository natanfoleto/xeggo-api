import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { authenticate } from '@/http/middlewares/authenticate'
import { BadRequestError } from '@/http/routes/_errors/bad-request-error'
import { prisma } from '@/lib/prisma'

export async function deleteProduct(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(authenticate)
    .delete(
      '/products/:productId',
      {
        schema: {
          tags: ['Produtos'],
          summary: 'Deletar produto',
          params: z.object({
            productId: z
              .string({
                required_error: 'O ID do produto é obrigatório',
                invalid_type_error: 'O ID do produto deve ser uma string',
              })
              .cuid('O ID do produto deve ser um CUID válido')
              .max(30, 'O ID do produto deve ter no máximo 30 caracteres'),
          }),
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const { productId } = request.params

        const product = await prisma.product.findUnique({
          where: { id: productId },
        })

        if (!product) {
          throw new BadRequestError('Produto não encontrado.')
        }

        // O Prisma vai deletar automaticamente ingredientes e complementos (onDelete: Cascade)
        await prisma.product.delete({
          where: { id: productId },
        })

        return reply.status(204).send()
      },
    )
}
