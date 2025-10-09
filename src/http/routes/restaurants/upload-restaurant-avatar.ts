import fastifyMultipart, { type MultipartFile } from '@fastify/multipart'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { authenticate } from '@/http/middlewares/authenticate'
import { BadRequestError } from '@/http/routes/_errors/bad-request-error'
import { prisma } from '@/lib/prisma'
import { getS3PathURL } from '@/utils/aws'

export async function uploadRestaurantAvatar(app: FastifyInstance) {
  app
    .register(authenticate)
    .register(fastifyMultipart, { attachFieldsToBody: true })
    .withTypeProvider<ZodTypeProvider>()
    .post(
      '/avatar',
      {
        schema: {
          tags: ['Restaurantes'],
          summary: 'Upload do avatar do restaurante',
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
              avatarUrl: z
                .string({
                  required_error: 'A URL do avatar é obrigatória',
                  invalid_type_error: 'A URL do avatar deve ser uma string',
                })
                .url('A URL do avatar deve ser válida'),
            }),
          },
        },
      },
      async (request, reply) => {
        const { restaurantId } = await request.getCurrentUser()

        const body = request.body

        const buffer = await body.file.toBuffer()

        if (!buffer) {
          throw new BadRequestError('Arquivo de imagem inválido.')
        }

        const extension = body.file.filename.split('.').pop()
        const fileName = `avatar.${extension}`
        const objectName = `restaurants/${restaurantId}/${fileName}`

        await app.s3Client.uploadFile(
          process.env.R2_BUCKET_NAME,
          objectName,
          buffer,
          body.file.mimetype,
        )

        const avatarUrl = getS3PathURL({ objectName })

        await prisma.restaurant.update({
          where: { id: restaurantId },
          data: { avatarUrl },
        })

        return reply.status(201).send({ avatarUrl })
      },
    )
}
