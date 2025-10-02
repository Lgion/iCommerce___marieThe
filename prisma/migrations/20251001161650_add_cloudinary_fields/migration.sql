-- AlterTable
ALTER TABLE "Product" ADD COLUMN "imageFolder" TEXT;
ALTER TABLE "Product" ADD COLUMN "imagePublicId" TEXT;

-- AlterTable
ALTER TABLE "Service" ADD COLUMN "imageFolder" TEXT;
ALTER TABLE "Service" ADD COLUMN "imagePublicId" TEXT;

-- AlterTable
ALTER TABLE "ServiceDetails" ADD COLUMN "imageFolder" TEXT;
ALTER TABLE "ServiceDetails" ADD COLUMN "imagePublicId" TEXT;
