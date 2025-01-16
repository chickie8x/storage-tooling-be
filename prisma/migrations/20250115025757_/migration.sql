/*
  Warnings:

  - Added the required column `sessionType` to the `SessionTransport` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SessionTransport" ADD COLUMN     "sessionType" TEXT NOT NULL;
