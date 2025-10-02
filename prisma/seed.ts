import { faker } from '@faker-js/faker'
import { createId } from '@paralleldrive/cuid2'
import chalk from 'chalk'

import { prisma } from '../src/lib/prisma'

async function main() {
  console.log(chalk.yellow('🔹 Resetting database...'))

  // Delete tudo na ordem correta (foreign keys)
  await prisma.orderItemComplement.deleteMany({})
  await prisma.orderItem.deleteMany({})
  await prisma.order.deleteMany({})
  await prisma.evaluation.deleteMany({})
  await prisma.complement.deleteMany({})
  await prisma.complementGroup.deleteMany({})
  await prisma.ingredient.deleteMany({})
  await prisma.product.deleteMany({})
  await prisma.restaurant.deleteMany({})
  await prisma.authLink.deleteMany({})
  await prisma.user.deleteMany({})

  console.log(chalk.yellow('✔ Database reset'))

  // Criar clientes
  const customer1 = await prisma.user.create({
    data: {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      role: 'customer',
    },
  })

  const customer2 = await prisma.user.create({
    data: {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      role: 'customer',
    },
  })

  console.log(chalk.yellow('✔ Created customers'))

  // Criar manager
  const manager = await prisma.user.create({
    data: {
      name: faker.person.fullName(),
      email: 'diego.schell.f@gmail.com',
      role: 'manager',
    },
  })

  console.log(chalk.yellow('✔ Created manager'))

  // Criar restaurante
  const restaurant = await prisma.restaurant.create({
    data: {
      name: faker.company.name(),
      description: faker.lorem.paragraph(),
      managerId: manager.id,
    },
  })

  console.log(chalk.yellow('✔ Created restaurant'))

  // Listas de ingredientes e complementos possíveis
  const possibleIngredients = [
    'Alface',
    'Tomate',
    'Queijo',
    'Presunto',
    'Bacon',
    'Cebola',
    'Picles',
    'Molho especial',
    'Pão',
    'Carne',
    'Frango',
    'Maionese',
    'Ketchup',
    'Mostarda',
    'Cheddar',
    'Mussarela',
  ]

  const complementsData = {
    adicionais: [
      { name: 'Bacon', price: 500 },
      { name: 'Cheddar', price: 300 },
      { name: 'Ovo', price: 200 },
      { name: 'Calabresa', price: 400 },
      { name: 'Catupiry', price: 350 },
    ],
    molhos: [
      { name: 'Barbecue', price: 100 },
      { name: 'Maionese temperada', price: 100 },
      { name: 'Mostarda e mel', price: 150 },
      { name: 'Pimenta', price: 50 },
    ],
    bebidas: [
      { name: 'Coca-Cola 350ml', price: 500 },
      { name: 'Guaraná 350ml', price: 450 },
      { name: 'Suco Natural 300ml', price: 600 },
      { name: 'Água 500ml', price: 300 },
    ],
    pontos: [
      { name: 'Mal passado', price: 0 },
      { name: 'Ao ponto', price: 0 },
      { name: 'Bem passado', price: 0 },
    ],
  }

  // Criar produtos com ingredientes e grupos de complementos
  const products = []

  for (let i = 0; i < 10; i++) {
    const product = await prisma.product.create({
      data: {
        name: faker.commerce.productName(),
        priceInCents: Number(
          faker.commerce.price({ min: 190, max: 490, dec: 0 }),
        ),
        restaurantId: restaurant.id,
        description: faker.commerce.productDescription(),
      },
    })

    // Adicionar ingredientes (3-6 ingredientes por produto)
    const productIngredients = faker.helpers.arrayElements(
      possibleIngredients,
      {
        min: 3,
        max: 6,
      },
    )

    for (const ingredientName of productIngredients) {
      await prisma.ingredient.create({
        data: {
          name: ingredientName,
          productId: product.id,
        },
      })
    }

    // Criar grupos de complementos (2-4 grupos por produto)
    const groupsToCreate = faker.number.int({ min: 2, max: 4 })

    for (let g = 0; g < groupsToCreate; g++) {
      let groupName: string
      let complementsList: { name: string; price: number }[]
      let mandatory = false
      let min = 0
      let max = 1

      // Escolher tipo de grupo
      const groupType = faker.helpers.arrayElement([
        'adicionais',
        'molhos',
        'bebidas',
        'pontos',
      ])

      switch (groupType) {
        case 'adicionais':
          groupName = 'Adicionais'
          complementsList = complementsData.adicionais
          min = 0
          max = 5
          break
        case 'molhos':
          groupName = 'Molhos'
          complementsList = complementsData.molhos
          mandatory = true
          min = 1
          max = 2
          break
        case 'bebidas':
          groupName = 'Bebidas'
          complementsList = complementsData.bebidas
          min = 0
          max = 2
          break
        case 'pontos':
          groupName = 'Ponto da carne'
          complementsList = complementsData.pontos
          mandatory = true
          min = 1
          max = 1
          break
      }

      const complementGroup = await prisma.complementGroup.create({
        data: {
          name: groupName,
          mandatory,
          min,
          max,
          productId: product.id,
        },
      })

      // Adicionar complementos ao grupo
      const complementsToAdd = faker.helpers.arrayElements(complementsList, {
        min: 2,
        max: complementsList.length,
      })

      for (const comp of complementsToAdd) {
        await prisma.complement.create({
          data: {
            name: comp.name,
            priceInCents: comp.price,
            complementGroupId: complementGroup.id,
          },
        })
      }
    }

    products.push(product)
  }

  console.log(
    chalk.yellow('✔ Created products with ingredients and complements'),
  )

  // Criar orders + orderItems + orderItemComplements
  const ordersToCreate = []

  for (let i = 0; i < 200; i++) {
    const orderId = createId()

    const orderProducts = faker.helpers.arrayElements(products, {
      min: 1,
      max: 3,
    })

    const orderItemsData = []

    for (const p of orderProducts) {
      const quantity = faker.number.int({ min: 1, max: 3 })
      const orderItemId = createId()

      // Buscar grupos de complementos do produto
      const productGroups = await prisma.complementGroup.findMany({
        where: { productId: p.id },
        include: { complements: true },
      })

      const selectedComplements = []

      // Para cada grupo, selecionar complementos
      for (const group of productGroups) {
        if (group.complements.length > 0) {
          const numToSelect = group.mandatory
            ? faker.number.int({ min: group.min, max: group.max })
            : faker.number.int({ min: 0, max: Math.min(2, group.max) })

          if (numToSelect > 0) {
            const selectedComps = faker.helpers.arrayElements(
              group.complements,
              numToSelect,
            )

            for (const comp of selectedComps) {
              selectedComplements.push({
                complementId: comp.id,
                quantity: 1,
                priceInCents: comp.priceInCents || 0,
              })
            }
          }
        }
      }

      orderItemsData.push({
        id: orderItemId,
        productId: p.id,
        priceInCents: p.priceInCents,
        quantity,
        selectedComplements: {
          create: selectedComplements,
        },
      })
    }

    ordersToCreate.push(
      prisma.order.create({
        data: {
          id: orderId,
          customerId: faker.helpers.arrayElement([customer1.id, customer2.id]),
          restaurantId: restaurant.id,
          status: faker.helpers.arrayElement([
            'pending',
            'canceled',
            'processing',
            'delivering',
            'delivered',
          ]),
          createdAt: faker.date.recent({ days: 40 }),
          orderItems: {
            create: orderItemsData,
          },
        },
      }),
    )
  }

  await Promise.all(ordersToCreate)

  console.log(chalk.yellow('✔ Created orders with complements'))
  console.log(chalk.greenBright('🎉 Database seeded successfully!'))
}

main()
  .catch((e) => {
    console.error(e)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
