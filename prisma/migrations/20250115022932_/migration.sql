/*
  Warnings:

  - Added the required column `goodsStatus` to the `SessionTransport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `transportCodeQuantity` to the `SessionTransport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `transporter` to the `SessionTransport` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SessionTransport" ADD COLUMN     "goodsStatus" TEXT NOT NULL,
ADD COLUMN     "transportCodeQuantity" INTEGER NOT NULL,
ADD COLUMN     "transporter" TEXT NOT NULL;
