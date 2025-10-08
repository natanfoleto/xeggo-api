import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { authenticate } from '@/http/middlewares/authenticate'
import { BadRequestError } from '@/http/routes/_errors/bad-request-error'
import { prisma } from '@/lib/prisma'
import { getS3ObjectName } from '@/utils/aws'

export async function deleteProductImage(app: FastifyInstance) {
  app
    .register(authenticate)
    .withTypeProvider<ZodTypeProvider>()
    .delete(
      '/products/:productId/image',
      {
        schema: {
          tags: ['Produtos'],
          summary: 'Deletar imagem do produto',
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
        const { restaurantId } = await request.getCurrentUser()

        const product = await prisma.product.findUnique({
          where: { id: productId },
          select: {
            id: true,
            restaurantId: true,
            photoUrl: true,
          },
        })

        if (!product) {
          throw new BadRequestError('Produto não encontrado.')
        }

        if (product.restaurantId !== restaurantId) {
          throw new BadRequestError(
            'Este produto não pertence ao seu restaurante.',
          )
        }

        if (!product.photoUrl) {
          throw new BadRequestError('Este produto não possui imagem.')
        }

        const objectName = getS3ObjectName(product.photoUrl)

        await app.s3Client.deleteFile(process.env.R2_BUCKET_NAME, objectName)

        await prisma.product.update({
          where: { id: productId },
          data: { photoUrl: null },
        })

        return reply.status(204).send()
      },
    )
}
