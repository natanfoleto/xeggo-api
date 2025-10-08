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
}

main()
  .catch((e) => {
    console.error(e)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
