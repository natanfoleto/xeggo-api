-- CreateEnum
CREATE TYPE "segment" AS ENUM ('restaurant', 'bakery', 'snackBar', 'pizzeria', 'iceCreamShop', 'coffee', 'fastFood', 'barbecue', 'japanese', 'brazilian', 'italian', 'chinese', 'mexican', 'arabic', 'bar');

-- CreateEnum
CREATE TYPE "payment_method" AS ENUM ('cash', 'creditCard', 'debitCard', 'pix', 'voucher', 'bankTransfer');

-- AlterTable
ALTER TABLE "restaurants" ADD COLUMN     "minOrderInCents" INTEGER;

-- CreateTable
CREATE TABLE "restaurant_segments" (
    "id" VARCHAR(30) NOT NULL,
    "restaurantId" VARCHAR(30) NOT NULL,
    "segment" "segment" NOT NULL,
    "createdAt" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "restaurant_segments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "restaurant_payment_methods" (
    "id" VARCHAR(30) NOT NULL,
    "restaurantId" VARCHAR(30) NOT NULL,
    "paymentMethod" "payment_method" NOT NULL,
    "createdAt" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "restaurant_payment_methods_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "restaurant_segments_restaurantId_idx" ON "restaurant_segments"("restaurantId");

-- CreateIndex
CREATE UNIQUE INDEX "restaurant_segments_restaurantId_segment_key" ON "restaurant_segments"("restaurantId", "segment");

-- CreateIndex
CREATE INDEX "restaurant_payment_methods_restaurantId_idx" ON "restaurant_payment_methods"("restaurantId");

-- CreateIndex
CREATE UNIQUE INDEX "restaurant_payment_methods_restaurantId_paymentMethod_key" ON "restaurant_payment_methods"("restaurantId", "paymentMethod");

-- AddForeignKey
ALTER TABLE "restaurant_segments" ADD CONSTRAINT "restaurant_segments_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restaurant_payment_methods" ADD CONSTRAINT "restaurant_payment_methods_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
