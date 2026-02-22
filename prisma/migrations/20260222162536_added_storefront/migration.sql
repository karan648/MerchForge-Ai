-- CreateTable
CREATE TABLE "Storefront" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "storeName" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "bio" TEXT,
    "bannerUrl" TEXT,
    "logoUrl" TEXT,
    "primaryColor" TEXT NOT NULL DEFAULT '#895af6',
    "secondaryColor" TEXT,
    "socialLinks" JSONB,
    "customDomain" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Storefront_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Storefront_userId_key" ON "Storefront"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Storefront_slug_key" ON "Storefront"("slug");

-- CreateIndex
CREATE INDEX "Storefront_userId_idx" ON "Storefront"("userId");

-- CreateIndex
CREATE INDEX "Storefront_slug_idx" ON "Storefront"("slug");

-- CreateIndex
CREATE INDEX "Storefront_isPublished_idx" ON "Storefront"("isPublished");

-- AddForeignKey
ALTER TABLE "Storefront" ADD CONSTRAINT "Storefront_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
