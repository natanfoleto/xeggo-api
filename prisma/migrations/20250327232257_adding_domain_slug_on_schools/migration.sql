/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `schools` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[domain]` on the table `schools` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `schools` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "schools" ADD COLUMN     "domain" TEXT,
ADD COLUMN     "should_attach_users_by_domain" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "slug" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "schools_slug_key" ON "schools"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "schools_domain_key" ON "schools"("domain");
