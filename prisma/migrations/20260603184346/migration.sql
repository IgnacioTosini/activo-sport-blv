/*
  Warnings:

  - Added the required column `brand` to the `CartItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CartItem" ADD COLUMN     "brand" TEXT NOT NULL;
