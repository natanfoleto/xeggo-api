-- CreateTable
CREATE TABLE "school_settings" (
    "id" TEXT NOT NULL,
    "last_student_code" INTEGER NOT NULL,
    "school_id" TEXT NOT NULL,

    CONSTRAINT "school_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "school_settings_school_id_key" ON "school_settings"("school_id");

-- AddForeignKey
ALTER TABLE "school_settings" ADD CONSTRAINT "school_settings_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;
