/*
  Warnings:

  - You are about to drop the column `currency` on the `Expense` table. All the data in the column will be lost.
  - Added the required column `ownerId` to the `Expense` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `type` on the `Expense` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('income', 'expense');

-- AlterTable
ALTER TABLE "Expense" DROP COLUMN "currency",
ADD COLUMN     "ownerId" INTEGER NOT NULL,
ALTER COLUMN "amount" SET DATA TYPE DOUBLE PRECISION,
DROP COLUMN "type",
ADD COLUMN     "type" "TransactionType" NOT NULL;

-- AlterTable
ALTER TABLE "session" ALTER COLUMN "sess" SET DATA TYPE JSONB;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "IDX_session_expire" RENAME TO "session_expire_idx";
