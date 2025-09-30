import { faker } from '@faker-js/faker'
import { createId } from '@paralleldrive/cuid2'
import chalk from 'chalk'

import { prisma } from '../src/lib/prisma'

async function main() {
  console.log(chalk.yellow('🔹 Resetting database...'))

  // Delete tudo na ordem correta (foreign keys)
  await prisma.orderItem.deleteMany({})
  await prisma.order.deleteMany({})
  await prisma.evaluation.deleteMany({})
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

  // Criar produtos
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
    products.push(product)
  }

  console.log(chalk.yellow('✔ Created products'))

  // Criar orders + orderItems
  const ordersToCreate = []
  for (let i = 0; i < 200; i++) {
    const orderId = createId()

    const orderProducts = faker.helpers.arrayElements(products, {
      min: 1,
      max: 3,
    })

    const orderItemsData = orderProducts.map((p) => {
      const quantity = faker.number.int({ min: 1, max: 3 })
      return {
        productId: p.id,
        priceInCents: p.priceInCents,
        quantity,
      }
    })

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

  console.log(chalk.yellow('✔ Created orders'))
  console.log(chalk.greenBright('🎉 Database seeded successfully!'))
}

main()
  .catch((e) => {
    console.error(e)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
