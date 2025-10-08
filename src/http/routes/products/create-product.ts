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
      '/products',
      {
        schema: {
          tags: ['Produtos'],
          summary: 'Criar produto',
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
            ingredients: z
              .array(
                z.object({
                  name: z
                    .string({
                      required_error: 'O nome do ingrediente é obrigatório',
                      invalid_type_error:
                        'O nome do ingrediente deve ser uma string',
                    })
                    .min(
                      1,
                      'O nome do ingrediente deve ter pelo menos 1 caractere',
                    )
                    .max(
                      100,
                      'O nome do ingrediente deve ter no máximo 100 caracteres',
                    ),
                }),
              )
              .default([]),
            complementGroups: z
              .array(
                z.object({
                  name: z
                    .string({
                      required_error: 'O nome do grupo é obrigatório',
                      invalid_type_error: 'O nome do grupo deve ser uma string',
                    })
                    .min(1, 'O nome do grupo deve ter pelo menos 1 caractere')
                    .max(
                      100,
                      'O nome do grupo deve ter no máximo 100 caracteres',
                    ),
                  mandatory: z
                    .boolean({
                      invalid_type_error:
                        'O campo obrigatório deve ser um booleano',
                    })
                    .default(false),
                  min: z
                    .number({
                      invalid_type_error: 'O mínimo deve ser um número',
                    })
                    .int('O mínimo deve ser um número inteiro')
                    .min(0, 'O mínimo deve ser no mínimo 0')
                    .default(0),
                  max: z
                    .number({
                      invalid_type_error: 'O máximo deve ser um número',
                    })
                    .int('O máximo deve ser um número inteiro')
                    .min(1, 'O máximo deve ser no mínimo 1')
                    .default(1),
                  complements: z.array(
                    z.object({
                      name: z
                        .string({
                          required_error: 'O nome do complemento é obrigatório',
                          invalid_type_error:
                            'O nome do complemento deve ser uma string',
                        })
                        .min(
                          1,
                          'O nome do complemento deve ter pelo menos 1 caractere',
                        )
                        .max(
                          100,
                          'O nome do complemento deve ter no máximo 100 caracteres',
                        ),
                      priceInCents: z
                        .number({
                          invalid_type_error:
                            'O preço do complemento deve ser um número',
                        })
                        .int(
                          'O preço do complemento deve ser um número inteiro',
                        )
                        .min(0, 'O preço do complemento deve ser no mínimo 0')
                        .optional()
                        .nullable(),
                      description: z
                        .string({
                          invalid_type_error:
                            'A descrição do complemento deve ser uma string',
                        })
                        .max(
                          300,
                          'A descrição do complemento deve ter no máximo 300 caracteres',
                        )
                        .optional()
                        .nullable(),
                    }),
                  ),
                }),
              )
              .default([]),
          }),
          response: {
            201: z.object({
              productId: z.string().cuid(),
            }),
          },
        },
      },
      async (request, reply) => {
        const { restaurantId } = await request.getCurrentUser()

        const {
          name,
          description,
          priceInCents,
          categoryId,
          active,
          ingredients,
          complementGroups,
        } = request.body

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
            ingredients: {
              create: ingredients.map((ingredient) => ({
                name: ingredient.name,
              })),
            },
            complementGroups: {
              create: complementGroups.map((group) => ({
                name: group.name,
                mandatory: group.mandatory,
                min: group.min,
                max: group.max,
                complements: {
                  create: group.complements.map((complement) => ({
                    name: complement.name,
                    priceInCents: complement.priceInCents,
                    description: complement.description,
                  })),
                },
              })),
            },
          },
          select: { id: true },
        })

        return reply.status(201).send({
          productId: product.id,
        })
      },
    )
}
