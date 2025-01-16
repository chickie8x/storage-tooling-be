/*
  Warnings:

  - Added the required column `userId` to the `TransportCode` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TransportCode" ADD COLUMN     "userId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "TransportCode" ADD CONSTRAINT "TransportCode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
