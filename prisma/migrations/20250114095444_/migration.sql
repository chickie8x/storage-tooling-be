/*
  Warnings:

  - Added the required column `goodsStatus` to the `TransportCode` table without a default value. This is not possible if the table is not empty.
  - Added the required column `transporter` to the `TransportCode` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TransportCode" ADD COLUMN     "goodsStatus" TEXT NOT NULL,
ADD COLUMN     "transporter" TEXT NOT NULL;
