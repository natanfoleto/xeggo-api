/*
  Warnings:

  - A unique constraint covering the columns `[cpf]` on the table `students` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "students_cpf_key" ON "students"("cpf");
