import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { authenticate } from '@/http/middlewares/authenticate'
import { BadRequestError } from '@/http/routes/_errors/bad-request-error'
import { prisma } from '@/lib/prisma'
import { getS3ObjectName } from '@/utils/aws'

export async function deleteRestaurantAvatar(app: FastifyInstance) {
  app
    .register(authenticate)
    .withTypeProvider<ZodTypeProvider>()
    .delete(
      '/avatar',
      {
        schema: {
          tags: ['Restaurantes'],
          summary: 'Deletar avatar do restaurante',
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const { restaurantId } = await request.getCurrentUser()

        const restaurant = await prisma.restaurant.findUnique({
          where: { id: restaurantId },
          select: {
            id: true,
            avatarUrl: true,
          },
        })

        if (!restaurant) {
          throw new BadRequestError('Restaurante não encontrado.')
        }

        if (!restaurant.avatarUrl) {
          throw new BadRequestError('Este restaurante não possui avatar.')
        }

        const objectName = getS3ObjectName(restaurant.avatarUrl)

        await app.s3Client.deleteFile(process.env.R2_BUCKET_NAME, objectName)

        await prisma.restaurant.update({
          where: { id: restaurantId },
          data: { avatarUrl: null },
        })

        return reply.status(204).send()
      },
    )
}
