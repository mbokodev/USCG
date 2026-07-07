-- AlterTable
ALTER TABLE "SellerRequest" ADD COLUMN     "enabledContactMethods" TEXT[] DEFAULT ARRAY[]::TEXT[];
