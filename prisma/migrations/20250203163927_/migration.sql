/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `TransportCode` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "SessionTransport" ALTER COLUMN "note" SET DEFAULT '';

-- AlterTable
ALTER TABLE "TransportCode" ADD COLUMN     "isDone" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "note" TEXT NOT NULL DEFAULT '';

-- CreateIndex
CREATE UNIQUE INDEX "TransportCode_code_key" ON "TransportCode"("code");
