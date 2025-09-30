/*
  Warnings:

  - You are about to drop the column `tipo` on the `tokens` table. All the data in the column will be lost.
  - Added the required column `type` to the `tokens` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TokenType" AS ENUM ('PASSWORD_RECOVER');

-- AlterTable
ALTER TABLE "tokens" DROP COLUMN "tipo",
ADD COLUMN     "type" "TokenType" NOT NULL;

-- DropEnum
DROP TYPE "TipoToken";
