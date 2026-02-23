-- CreateTable
CREATE TABLE "StorefrontFollow" (
    "id" TEXT NOT NULL,
    "followerId" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StorefrontFollow_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StorefrontFollow_followerId_creatorId_key" ON "StorefrontFollow"("followerId", "creatorId");

-- CreateIndex
CREATE INDEX "StorefrontFollow_creatorId_createdAt_idx" ON "StorefrontFollow"("creatorId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "StorefrontFollow_followerId_createdAt_idx" ON "StorefrontFollow"("followerId", "createdAt" DESC);

-- AddForeignKey
ALTER TABLE "StorefrontFollow" ADD CONSTRAINT "StorefrontFollow_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StorefrontFollow" ADD CONSTRAINT "StorefrontFollow_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
