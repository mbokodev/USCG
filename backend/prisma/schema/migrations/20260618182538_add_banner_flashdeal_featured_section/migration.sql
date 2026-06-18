/*
  Warnings:

  - A unique constraint covering the columns `[businessLogoId]` on the table `SellerRequest` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "FilterType" AS ENUM ('NONE', 'CITY', 'SUBCATEGORY', 'VARIANT');

-- AlterTable
ALTER TABLE "Ad" ADD COLUMN     "discountedPrice" DOUBLE PRECISION,
ALTER COLUMN "price" DROP NOT NULL;

-- AlterTable
ALTER TABLE "File" ADD COLUMN     "isDefault" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "SellerRequest" ADD COLUMN     "businessLogoId" TEXT;

-- CreateTable
CREATE TABLE "Banner" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT NOT NULL,
    "buttonText" TEXT,
    "buttonLink" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Banner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "featured_sections" (
    "id" TEXT NOT NULL,
    "title" JSONB NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "categoryId" TEXT,
    "subCategoryId" TEXT,
    "filterType" "FilterType" NOT NULL DEFAULT 'NONE',
    "variantId" TEXT,
    "limit" INTEGER NOT NULL DEFAULT 20,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "featured_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FlashDeal" (
    "id" TEXT NOT NULL,
    "adId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FlashDeal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "featured_sections_isActive_idx" ON "featured_sections"("isActive");

-- CreateIndex
CREATE INDEX "featured_sections_order_idx" ON "featured_sections"("order");

-- CreateIndex
CREATE INDEX "featured_sections_categoryId_idx" ON "featured_sections"("categoryId");

-- CreateIndex
CREATE INDEX "featured_sections_subCategoryId_idx" ON "featured_sections"("subCategoryId");

-- CreateIndex
CREATE UNIQUE INDEX "FlashDeal_adId_key" ON "FlashDeal"("adId");

-- CreateIndex
CREATE INDEX "FlashDeal_isActive_idx" ON "FlashDeal"("isActive");

-- CreateIndex
CREATE INDEX "FlashDeal_startDate_idx" ON "FlashDeal"("startDate");

-- CreateIndex
CREATE INDEX "FlashDeal_endDate_idx" ON "FlashDeal"("endDate");

-- CreateIndex
CREATE INDEX "FlashDeal_order_idx" ON "FlashDeal"("order");

-- CreateIndex
CREATE UNIQUE INDEX "SellerRequest_businessLogoId_key" ON "SellerRequest"("businessLogoId");

-- AddForeignKey
ALTER TABLE "featured_sections" ADD CONSTRAINT "featured_sections_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "featured_sections" ADD CONSTRAINT "featured_sections_subCategoryId_fkey" FOREIGN KEY ("subCategoryId") REFERENCES "SubCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "featured_sections" ADD CONSTRAINT "featured_sections_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlashDeal" ADD CONSTRAINT "FlashDeal_adId_fkey" FOREIGN KEY ("adId") REFERENCES "Ad"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SellerRequest" ADD CONSTRAINT "SellerRequest_businessLogoId_fkey" FOREIGN KEY ("businessLogoId") REFERENCES "File"("id") ON DELETE SET NULL ON UPDATE CASCADE;
