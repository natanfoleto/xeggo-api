import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { authenticate } from '@/http/middlewares/authenticate'
import { BadRequestError } from '@/http/routes/_errors/bad-request-error'
import { prisma } from '@/lib/prisma'

export async function updateProduct(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(authenticate)
    .put(
      '/products/:productId',
      {
        schema: {
          tags: ['Produtos'],
          summary: 'Atualizar produto',
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
            name: z
              .string({
                invalid_type_error: 'O nome deve ser uma string',
              })
              .min(1, 'O nome deve ter pelo menos 1 caractere')
              .max(100, 'O nome deve ter no máximo 100 caracteres')
              .optional(),
            description: z
              .string({
                invalid_type_error: 'A descrição deve ser uma string',
              })
              .max(500, 'A descrição deve ter no máximo 500 caracteres')
              .optional(),
            priceInCents: z
              .number({
                invalid_type_error: 'O preço deve ser um número',
              })
              .int('O preço deve ser um número inteiro')
              .positive('O preço deve ser positivo')
              .optional(),
            categoryId: z
              .string({
                invalid_type_error: 'O ID da categoria deve ser uma string',
              })
              .cuid('O ID da categoria deve ser um CUID válido')
              .max(30, 'O ID da categoria deve ter no máximo 30 caracteres')
              .optional(),
            active: z
              .boolean({
                invalid_type_error: 'O campo ativo deve ser um booleano',
              })
              .optional(),
          }),
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const { productId } = request.params
        const { name, description, priceInCents, categoryId, active } =
          request.body

        const currentProduct = await prisma.product.findUnique({
          where: { id: productId },
        })

        if (!currentProduct) {
          throw new BadRequestError('Produto não encontrado.')
        }

        // Se está mudando a categoria, validar
        if (categoryId && categoryId !== currentProduct.categoryId) {
          const category = await prisma.category.findUnique({
            where: { id: categoryId },
          })

          if (!category) {
            throw new BadRequestError('Categoria não encontrada.')
          }

          if (category.restaurantId !== currentProduct.restaurantId) {
            throw new BadRequestError(
              'Esta categoria não pertence ao restaurante do produto.',
            )
          }
        }

        await prisma.product.update({
          where: { id: productId },
          data: {
            name,
            description,
            priceInCents,
            categoryId,
            active,
          },
        })

        return reply.status(204).send()
      },
    )
}
