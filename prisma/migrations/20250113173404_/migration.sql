/*
  Warnings:

  - Added the required column `sessionCode` to the `SessionTransport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `code` to the `TransportCode` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SessionTransport" ADD COLUMN     "sessionCode" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "TransportCode" ADD COLUMN     "code" TEXT NOT NULL;
