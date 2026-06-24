-- CreateTable
CREATE TABLE "SellerTermsPage" (
    "id" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SellerTermsPage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SellerPrivacyPage" (
    "id" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SellerPrivacyPage_pkey" PRIMARY KEY ("id")
);
