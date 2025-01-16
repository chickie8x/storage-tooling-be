/*
  Warnings:

  - Added the required column `author` to the `TransportCode` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TransportCode" ADD COLUMN     "author" TEXT NOT NULL;
