/*
  Warnings:

  - Added the required column `author` to the `SessionTransport` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SessionTransport" ADD COLUMN     "author" TEXT NOT NULL;
