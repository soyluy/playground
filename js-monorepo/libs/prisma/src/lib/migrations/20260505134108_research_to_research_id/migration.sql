/*
  Warnings:

  - You are about to drop the column `research` on the `Todo` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Todo" DROP COLUMN "research",
ADD COLUMN     "researchId" TEXT;
