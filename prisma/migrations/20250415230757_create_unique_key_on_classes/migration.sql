/*
  Warnings:

  - A unique constraint covering the columns `[name,year,school_id]` on the table `classes` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "classes_name_year_school_id_key" ON "classes"("name", "year", "school_id");
