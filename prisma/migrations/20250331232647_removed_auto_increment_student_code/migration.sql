/*
  Warnings:

  - A unique constraint covering the columns `[code,school_id]` on the table `students` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "students_code_key";

-- AlterTable
ALTER TABLE "students" ALTER COLUMN "code" DROP DEFAULT;
DROP SEQUENCE "students_code_seq";

-- CreateIndex
CREATE UNIQUE INDEX "students_code_school_id_key" ON "students"("code", "school_id");
