import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { authenticate } from '@/http/middlewares/authenticate'
import { BadRequestError } from '@/http/routes/_errors/bad-request-error'
import { prisma } from '@/lib/prisma'

export async function createProduct(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(authenticate)
    .post(
      '/restaurants/:restaurantId/products',
      {
        schema: {
          tags: ['Produtos'],
          summary: 'Criar produto',
          params: z.object({
            restaurantId: z
              .string({
                required_error: 'O ID do restaurante é obrigatório',
                invalid_type_error: 'O ID do restaurante deve ser uma string',
              })
              .max(30, 'O ID do restaurante deve ter no máximo 30 caracteres'),
          }),
          body: z.object({
            name: z
              .string({
                required_error: 'O nome é obrigatório',
                invalid_type_error: 'O nome deve ser uma string',
              })
              .min(1, 'O nome deve ter pelo menos 1 caractere')
              .max(100, 'O nome deve ter no máximo 100 caracteres'),
            description: z
              .string({
                invalid_type_error: 'A descrição deve ser uma string',
              })
              .max(500, 'A descrição deve ter no máximo 500 caracteres')
              .optional(),
            priceInCents: z
              .number({
                required_error: 'O preço é obrigatório',
                invalid_type_error: 'O preço deve ser um número',
              })
              .int('O preço deve ser um número inteiro')
              .positive('O preço deve ser positivo'),
            categoryId: z
              .string({
                required_error: 'O ID da categoria é obrigatório',
                invalid_type_error: 'O ID da categoria deve ser uma string',
              })
              .max(30, 'O ID da categoria deve ter no máximo 30 caracteres'),
            active: z
              .boolean({
                invalid_type_error: 'O campo ativo deve ser um booleano',
              })
              .default(true),
          }),
          response: {
            201: z.object({
              productId: z.string().cuid(),
            }),
          },
        },
      },
      async (request, reply) => {
        const { restaurantId } = request.params
        const { name, description, priceInCents, categoryId, active } =
          request.body

        // Verificar se a categoria existe e pertence ao restaurante
        const category = await prisma.category.findUnique({
          where: { id: categoryId },
        })

        if (!category) {
          throw new BadRequestError('Categoria não encontrada.')
        }

        if (category.restaurantId !== restaurantId) {
          throw new BadRequestError(
            'Esta categoria não pertence a este restaurante.',
          )
        }

        const product = await prisma.product.create({
          data: {
            name,
            description,
            priceInCents,
            categoryId,
            active,
            restaurantId,
          },
          select: { id: true },
        })

        return reply.status(201).send({
          productId: product.id,
        })
      },
    )
}
