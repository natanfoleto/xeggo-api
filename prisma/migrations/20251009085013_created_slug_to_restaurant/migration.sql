/*
  Warnings:

  - The primary key for the `auth_links` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `auth_links` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(30)`.
  - You are about to alter the column `code` on the `auth_links` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `userId` on the `auth_links` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(30)`.
  - The primary key for the `categories` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `categories` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(30)`.
  - You are about to alter the column `name` on the `categories` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - You are about to alter the column `description` on the `categories` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(300)`.
  - You are about to alter the column `restaurantId` on the `categories` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(30)`.
  - The primary key for the `complement_groups` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `complement_groups` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(30)`.
  - You are about to alter the column `name` on the `complement_groups` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `min` on the `complement_groups` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `SmallInt`.
  - You are about to alter the column `max` on the `complement_groups` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `SmallInt`.
  - You are about to alter the column `productId` on the `complement_groups` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(30)`.
  - The primary key for the `complements` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `complements` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(30)`.
  - You are about to alter the column `name` on the `complements` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `description` on the `complements` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(300)`.
  - You are about to alter the column `complementGroupId` on the `complements` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(30)`.
  - The primary key for the `evaluations` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `evaluations` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(30)`.
  - You are about to alter the column `customerId` on the `evaluations` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(30)`.
  - You are about to alter the column `restaurantId` on the `evaluations` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(30)`.
  - You are about to alter the column `rate` on the `evaluations` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `SmallInt`.
  - You are about to alter the column `comment` on the `evaluations` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(1000)`.
  - The primary key for the `ingredients` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `ingredients` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(30)`.
  - You are about to alter the column `name` on the `ingredients` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `productId` on the `ingredients` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(30)`.
  - The primary key for the `order_items` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `order_items` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(30)`.
  - You are about to alter the column `orderId` on the `order_items` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(30)`.
  - You are about to alter the column `productId` on the `order_items` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(30)`.
  - You are about to alter the column `quantity` on the `order_items` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `SmallInt`.
  - You are about to alter the column `observations` on the `order_items` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(500)`.
  - The primary key for the `order_items_complements` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `order_items_complements` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(30)`.
  - You are about to alter the column `orderItemId` on the `order_items_complements` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(30)`.
  - You are about to alter the column `complementId` on the `order_items_complements` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(30)`.
  - You are about to alter the column `quantity` on the `order_items_complements` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `SmallInt`.
  - The primary key for the `orders` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `orders` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(30)`.
  - You are about to alter the column `customerId` on the `orders` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(30)`.
  - You are about to alter the column `restaurantId` on the `orders` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(30)`.
  - The primary key for the `products` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `products` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(30)`.
  - You are about to alter the column `name` on the `products` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `description` on the `products` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(500)`.
  - You are about to alter the column `photoUrl` on the `products` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(500)`.
  - You are about to alter the column `restaurantId` on the `products` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(30)`.
  - You are about to alter the column `categoryId` on the `products` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(30)`.
  - The primary key for the `restaurants` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `restaurants` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(30)`.
  - You are about to alter the column `name` on the `restaurants` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `description` on the `restaurants` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(500)`.
  - You are about to alter the column `managerId` on the `restaurants` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(30)`.
  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `users` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(30)`.
  - You are about to alter the column `name` on the `users` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `email` on the `users` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `phone` on the `users` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(20)`.
  - Added the required column `slug` to the `restaurants` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "auth_links" DROP CONSTRAINT "auth_links_userId_fkey";

-- DropForeignKey
ALTER TABLE "categories" DROP CONSTRAINT "categories_restaurantId_fkey";

-- DropForeignKey
ALTER TABLE "complement_groups" DROP CONSTRAINT "complement_groups_productId_fkey";

-- DropForeignKey
ALTER TABLE "complements" DROP CONSTRAINT "complements_complementGroupId_fkey";

-- DropForeignKey
ALTER TABLE "evaluations" DROP CONSTRAINT "evaluations_customerId_fkey";

-- DropForeignKey
ALTER TABLE "evaluations" DROP CONSTRAINT "evaluations_restaurantId_fkey";

-- DropForeignKey
ALTER TABLE "ingredients" DROP CONSTRAINT "ingredients_productId_fkey";

-- DropForeignKey
ALTER TABLE "order_items" DROP CONSTRAINT "order_items_orderId_fkey";

-- DropForeignKey
ALTER TABLE "order_items" DROP CONSTRAINT "order_items_productId_fkey";

-- DropForeignKey
ALTER TABLE "order_items_complements" DROP CONSTRAINT "order_items_complements_complementId_fkey";

-- DropForeignKey
ALTER TABLE "order_items_complements" DROP CONSTRAINT "order_items_complements_orderItemId_fkey";

-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_customerId_fkey";

-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_restaurantId_fkey";

-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "products_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "products_restaurantId_fkey";

-- DropForeignKey
ALTER TABLE "restaurants" DROP CONSTRAINT "restaurants_managerId_fkey";

-- AlterTable
ALTER TABLE "auth_links" DROP CONSTRAINT "auth_links_pkey",
ALTER COLUMN "id" SET DATA TYPE VARCHAR(30),
ALTER COLUMN "code" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "userId" SET DATA TYPE VARCHAR(30),
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(0),
ADD CONSTRAINT "auth_links_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "categories" DROP CONSTRAINT "categories_pkey",
ALTER COLUMN "id" SET DATA TYPE VARCHAR(30),
ALTER COLUMN "name" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "description" SET DATA TYPE VARCHAR(300),
ALTER COLUMN "restaurantId" SET DATA TYPE VARCHAR(30),
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(0),
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(0),
ADD CONSTRAINT "categories_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "complement_groups" DROP CONSTRAINT "complement_groups_pkey",
ALTER COLUMN "id" SET DATA TYPE VARCHAR(30),
ALTER COLUMN "name" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "min" SET DATA TYPE SMALLINT,
ALTER COLUMN "max" SET DATA TYPE SMALLINT,
ALTER COLUMN "productId" SET DATA TYPE VARCHAR(30),
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(0),
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(0),
ADD CONSTRAINT "complement_groups_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "complements" DROP CONSTRAINT "complements_pkey",
ALTER COLUMN "id" SET DATA TYPE VARCHAR(30),
ALTER COLUMN "name" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "description" SET DATA TYPE VARCHAR(300),
ALTER COLUMN "complementGroupId" SET DATA TYPE VARCHAR(30),
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(0),
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(0),
ADD CONSTRAINT "complements_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "evaluations" DROP CONSTRAINT "evaluations_pkey",
ALTER COLUMN "id" SET DATA TYPE VARCHAR(30),
ALTER COLUMN "customerId" SET DATA TYPE VARCHAR(30),
ALTER COLUMN "restaurantId" SET DATA TYPE VARCHAR(30),
ALTER COLUMN "rate" SET DATA TYPE SMALLINT,
ALTER COLUMN "comment" SET DATA TYPE VARCHAR(1000),
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(0),
ADD CONSTRAINT "evaluations_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "ingredients" DROP CONSTRAINT "ingredients_pkey",
ALTER COLUMN "id" SET DATA TYPE VARCHAR(30),
ALTER COLUMN "name" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "productId" SET DATA TYPE VARCHAR(30),
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(0),
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(0),
ADD CONSTRAINT "ingredients_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "order_items" DROP CONSTRAINT "order_items_pkey",
ALTER COLUMN "id" SET DATA TYPE VARCHAR(30),
ALTER COLUMN "orderId" SET DATA TYPE VARCHAR(30),
ALTER COLUMN "productId" SET DATA TYPE VARCHAR(30),
ALTER COLUMN "quantity" SET DATA TYPE SMALLINT,
ALTER COLUMN "observations" SET DATA TYPE VARCHAR(500),
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(0),
ADD CONSTRAINT "order_items_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "order_items_complements" DROP CONSTRAINT "order_items_complements_pkey",
ALTER COLUMN "id" SET DATA TYPE VARCHAR(30),
ALTER COLUMN "orderItemId" SET DATA TYPE VARCHAR(30),
ALTER COLUMN "complementId" SET DATA TYPE VARCHAR(30),
ALTER COLUMN "quantity" SET DATA TYPE SMALLINT,
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(0),
ADD CONSTRAINT "order_items_complements_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "orders" DROP CONSTRAINT "orders_pkey",
ALTER COLUMN "id" SET DATA TYPE VARCHAR(30),
ALTER COLUMN "customerId" SET DATA TYPE VARCHAR(30),
ALTER COLUMN "restaurantId" SET DATA TYPE VARCHAR(30),
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(0),
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(0),
ADD CONSTRAINT "orders_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "products" DROP CONSTRAINT "products_pkey",
ALTER COLUMN "id" SET DATA TYPE VARCHAR(30),
ALTER COLUMN "name" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "description" SET DATA TYPE VARCHAR(500),
ALTER COLUMN "photoUrl" SET DATA TYPE VARCHAR(500),
ALTER COLUMN "restaurantId" SET DATA TYPE VARCHAR(30),
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(0),
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(0),
ALTER COLUMN "categoryId" SET DATA TYPE VARCHAR(30),
ADD CONSTRAINT "products_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "restaurants" DROP CONSTRAINT "restaurants_pkey",
ADD COLUMN     "slug" VARCHAR(100) NOT NULL,
ALTER COLUMN "id" SET DATA TYPE VARCHAR(30),
ALTER COLUMN "name" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "description" SET DATA TYPE VARCHAR(500),
ALTER COLUMN "managerId" SET DATA TYPE VARCHAR(30),
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(0),
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(0),
ADD CONSTRAINT "restaurants_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "users" DROP CONSTRAINT "users_pkey",
ALTER COLUMN "id" SET DATA TYPE VARCHAR(30),
ALTER COLUMN "name" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "email" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "phone" SET DATA TYPE VARCHAR(20),
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(0),
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(0),
ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "restaurants" ADD CONSTRAINT "restaurants_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ingredients" ADD CONSTRAINT "ingredients_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complements" ADD CONSTRAINT "complements_complementGroupId_fkey" FOREIGN KEY ("complementGroupId") REFERENCES "complement_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complement_groups" ADD CONSTRAINT "complement_groups_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items_complements" ADD CONSTRAINT "order_items_complements_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "order_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items_complements" ADD CONSTRAINT "order_items_complements_complementId_fkey" FOREIGN KEY ("complementId") REFERENCES "complements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth_links" ADD CONSTRAINT "auth_links_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
