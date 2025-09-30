-- CreateEnum
CREATE TYPE "TipoToken" AS ENUM ('PASSWORD_RECOVER');

-- CreateTable
CREATE TABLE "tokens" (
    "id" TEXT NOT NULL,
    "tipo" "TipoToken" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "tokens_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "tokens" ADD CONSTRAINT "tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
