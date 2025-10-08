import fastifyMultipart, { type MultipartFile } from '@fastify/multipart'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { authenticate } from '@/http/middlewares/authenticate'
import { BadRequestError } from '@/http/routes/_errors/bad-request-error'
import { prisma } from '@/lib/prisma'
import { getS3PathURL } from '@/utils/aws'

export async function uploadProductImage(app: FastifyInstance) {
  app
    .register(authenticate)
    .register(fastifyMultipart, { attachFieldsToBody: true })
    .withTypeProvider<ZodTypeProvider>()
    .post(
      '/products/:productId/image',
      {
        schema: {
          tags: ['Produtos'],
          summary: 'Upload de imagem do produto',
          params: z.object({
            productId: z
              .string({
                required_error: 'O ID do produto é obrigatório',
                invalid_type_error: 'O ID do produto deve ser uma string',
              })
              .cuid('O ID do produto deve ser um CUID válido')
              .max(30, 'O ID do produto deve ter no máximo 30 caracteres'),
          }),
          body: z.object({
            file: z.custom<MultipartFile>(
              (value) =>
                value && typeof value === 'object' && 'toBuffer' in value,
              {
                message: 'Arquivo inválido',
              },
            ),
          }),
          response: {
            201: z.object({
              photoUrl: z
                .string({
                  required_error: 'A URL da foto é obrigatória',
                  invalid_type_error: 'A URL da foto deve ser uma string',
                })
                .url('A URL da foto deve ser válida'),
            }),
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

        const body = request.body

        const buffer = await body.file.toBuffer()

        if (!buffer) {
          throw new BadRequestError('Arquivo de imagem inválido.')
        }

        const time = new Date().getTime()
        const extension = body.file.filename.split('.').pop()
        const fileName = `${time}.${extension}`
        const objectName = `restaurants/${restaurantId}/products/${productId}/${fileName}`

        await app.s3Client.uploadFile(
          process.env.R2_BUCKET_NAME,
          objectName,
          buffer,
          body.file.mimetype,
        )

        const photoUrl = getS3PathURL({ objectName })

        await prisma.product.update({
          where: { id: productId },
          data: { photoUrl },
        })

        return reply.status(201).send({ photoUrl })
      },
    )
}
