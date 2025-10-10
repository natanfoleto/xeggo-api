-- CreateEnum
CREATE TYPE "week_day" AS ENUM ('0', '1', '2', '3', '4', '5', '6');

-- CreateTable
CREATE TABLE "opening_hours" (
    "id" VARCHAR(30) NOT NULL,
    "restaurantId" VARCHAR(30) NOT NULL,
    "weekDay" "week_day" NOT NULL,
    "openTime" VARCHAR(5) NOT NULL,
    "closeTime" VARCHAR(5) NOT NULL,
    "createdAt" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(0) NOT NULL,

    CONSTRAINT "opening_hours_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "opening_hours_restaurantId_weekDay_idx" ON "opening_hours"("restaurantId", "weekDay");

-- AddForeignKey
ALTER TABLE "opening_hours" ADD CONSTRAINT "opening_hours_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
