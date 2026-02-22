-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "ExperienceLevel" AS ENUM ('BEGINNER', 'ADVANCED', 'EXPERT');

-- CreateEnum
CREATE TYPE "UseCaseType" AS ENUM ('PERSONAL', 'BUSINESS', 'AGENCY');

-- CreateEnum
CREATE TYPE "DesignStatus" AS ENUM ('DRAFT', 'GENERATED', 'PUBLISHED', 'ARCHIVED', 'FAILED');

-- CreateEnum
CREATE TYPE "GenerationStatus" AS ENUM ('QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELED');

-- CreateEnum
CREATE TYPE "MockupStatus" AS ENUM ('DRAFT', 'READY', 'EXPORTED');

-- CreateEnum
CREATE TYPE "TemplateStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED', 'MODERATION_HOLD');

-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PAID', 'FULFILLMENT', 'IN_PRODUCTION', 'SHIPPED', 'DELIVERED', 'CANCELED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PlanTier" AS ENUM ('FREE', 'PRO', 'BUSINESS');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('TRIALING', 'ACTIVE', 'PAST_DUE', 'CANCELED', 'INCOMPLETE', 'UNPAID');

-- CreateEnum
CREATE TYPE "CreditUsageType" AS ENUM ('GENERATION', 'UPSCALE', 'REMOVE_BACKGROUND', 'MOCKUP_EXPORT', 'TEMPLATE_PURCHASE', 'ADMIN_ADJUSTMENT', 'BONUS', 'OTHER');

-- CreateEnum
CREATE TYPE "AffiliateStatus" AS ENUM ('INVITED', 'SIGNED_UP', 'CONVERTED', 'CANCELED');

-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('PENDING', 'PROCESSING', 'PAID', 'FAILED', 'CANCELED');

-- CreateEnum
CREATE TYPE "PayoutProvider" AS ENUM ('STRIPE', 'PAYPAL', 'MANUAL');

-- CreateEnum
CREATE TYPE "AiProvider" AS ENUM ('OPENAI', 'REPLICATE', 'STABILITY', 'LOCAL_SD');

-- CreateEnum
CREATE TYPE "PodProvider" AS ENUM ('NONE', 'PRINTFUL', 'PRINTIFY');

-- CreateEnum
CREATE TYPE "GarmentType" AS ENUM ('T_SHIRT', 'HOODIE', 'SWEATSHIRT', 'TANK_TOP', 'HAT', 'MUG', 'POSTER');

-- CreateEnum
CREATE TYPE "ReviewTargetType" AS ENUM ('STORE_PRODUCT', 'TEMPLATE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "supabaseId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "fullName" TEXT,
    "avatarUrl" TEXT,
    "bio" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "useCase" "UseCaseType",
    "experienceLevel" "ExperienceLevel",
    "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "referralCode" TEXT NOT NULL,
    "referredById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastLoginAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Design" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "negativePrompt" TEXT,
    "stylePreset" TEXT,
    "colorPalette" JSONB,
    "referenceImageUrl" TEXT,
    "primaryImageUrl" TEXT,
    "thumbnailUrl" TEXT,
    "metadata" JSONB,
    "status" "DesignStatus" NOT NULL DEFAULT 'DRAFT',
    "version" INTEGER NOT NULL DEFAULT 1,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Design_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Generation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "designId" TEXT,
    "provider" "AiProvider" NOT NULL,
    "model" TEXT,
    "prompt" TEXT NOT NULL,
    "negativePrompt" TEXT,
    "referenceImageUrl" TEXT,
    "colorPalette" JSONB,
    "variationCount" INTEGER NOT NULL DEFAULT 1,
    "status" "GenerationStatus" NOT NULL DEFAULT 'QUEUED',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "outputUrls" JSONB,
    "errorMessage" TEXT,
    "costCredits" INTEGER NOT NULL DEFAULT 1,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "Generation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mockup" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "designId" TEXT,
    "name" TEXT NOT NULL,
    "garmentType" "GarmentType" NOT NULL DEFAULT 'T_SHIRT',
    "garmentColor" TEXT,
    "canvasState" JSONB NOT NULL,
    "previewUrl" TEXT,
    "printReadyUrl" TEXT,
    "dpi" INTEGER NOT NULL DEFAULT 300,
    "status" "MockupStatus" NOT NULL DEFAULT 'DRAFT',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Mockup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Template" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "designId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "tags" JSONB,
    "thumbnailUrl" TEXT,
    "fileUrl" TEXT,
    "previewImages" JSONB,
    "priceCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" "TemplateStatus" NOT NULL DEFAULT 'DRAFT',
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "downloadsCount" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TemplatePurchase" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "orderId" TEXT,
    "amountCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "stripePaymentIntentId" TEXT,
    "downloadUrl" TEXT,
    "metadata" JSONB,
    "purchasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TemplatePurchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoreProduct" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "designId" TEXT,
    "mockupId" TEXT,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "priceCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" "ProductStatus" NOT NULL DEFAULT 'DRAFT',
    "podProvider" "PodProvider" NOT NULL DEFAULT 'NONE',
    "providerProductId" TEXT,
    "providerVariantId" TEXT,
    "images" JSONB,
    "printCostCents" INTEGER,
    "shippingProfile" JSONB,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoreProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "buyerId" TEXT,
    "sellerId" TEXT NOT NULL,
    "storeProductId" TEXT,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "fulfillmentProvider" "PodProvider" NOT NULL DEFAULT 'NONE',
    "fulfillmentOrderId" TEXT,
    "stripeCheckoutSessionId" TEXT,
    "stripePaymentIntentId" TEXT,
    "amountSubtotalCents" INTEGER NOT NULL,
    "amountTaxCents" INTEGER NOT NULL DEFAULT 0,
    "amountTotalCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "shippingAddress" JSONB,
    "billingAddress" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "plan" "PlanTier" NOT NULL DEFAULT 'FREE',
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'INCOMPLETE',
    "providerCustomerId" TEXT,
    "providerSubscriptionId" TEXT,
    "currentPeriodStart" TIMESTAMP(3),
    "currentPeriodEnd" TIMESTAMP(3),
    "trialEndsAt" TIMESTAMP(3),
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "monthlyCredits" INTEGER NOT NULL DEFAULT 50,
    "usageCreditsRemaining" INTEGER NOT NULL DEFAULT 50,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreditUsage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "generationId" TEXT,
    "type" "CreditUsageType" NOT NULL,
    "delta" INTEGER NOT NULL,
    "balanceAfter" INTEGER NOT NULL,
    "description" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CreditUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AffiliateReferral" (
    "id" TEXT NOT NULL,
    "referrerId" TEXT NOT NULL,
    "referredUserId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "status" "AffiliateStatus" NOT NULL DEFAULT 'INVITED',
    "commissionRate" DECIMAL(5,4) NOT NULL DEFAULT 0.1,
    "lifetimeRevenueCents" INTEGER NOT NULL DEFAULT 0,
    "recurringCommissionCents" INTEGER NOT NULL DEFAULT 0,
    "firstConvertedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AffiliateReferral_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payout" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "referralId" TEXT,
    "amountCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" "PayoutStatus" NOT NULL DEFAULT 'PENDING',
    "provider" "PayoutProvider" NOT NULL DEFAULT 'STRIPE',
    "providerPayoutId" TEXT,
    "scheduledFor" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrandKit" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Default',
    "logoUrl" TEXT,
    "faviconUrl" TEXT,
    "primaryColor" TEXT,
    "secondaryColor" TEXT,
    "accentColor" TEXT,
    "fontPrimary" TEXT,
    "fontSecondary" TEXT,
    "toneOfVoice" TEXT,
    "socialLinks" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BrandKit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "sellerId" TEXT,
    "storeProductId" TEXT,
    "templateId" TEXT,
    "orderId" TEXT,
    "rating" INTEGER NOT NULL,
    "title" TEXT,
    "comment" TEXT,
    "targetType" "ReviewTargetType" NOT NULL,
    "isVerifiedPurchase" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_supabaseId_key" ON "User"("supabaseId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_referralCode_key" ON "User"("referralCode");

-- CreateIndex
CREATE INDEX "User_referredById_idx" ON "User"("referredById");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "Design_userId_createdAt_idx" ON "Design"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Design_status_idx" ON "Design"("status");

-- CreateIndex
CREATE INDEX "Generation_userId_createdAt_idx" ON "Generation"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Generation_designId_idx" ON "Generation"("designId");

-- CreateIndex
CREATE INDEX "Generation_status_idx" ON "Generation"("status");

-- CreateIndex
CREATE INDEX "Mockup_userId_createdAt_idx" ON "Mockup"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Mockup_designId_idx" ON "Mockup"("designId");

-- CreateIndex
CREATE INDEX "Template_creatorId_status_idx" ON "Template"("creatorId", "status");

-- CreateIndex
CREATE INDEX "Template_priceCents_idx" ON "Template"("priceCents");

-- CreateIndex
CREATE UNIQUE INDEX "TemplatePurchase_orderId_key" ON "TemplatePurchase"("orderId");

-- CreateIndex
CREATE INDEX "TemplatePurchase_buyerId_purchasedAt_idx" ON "TemplatePurchase"("buyerId", "purchasedAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "TemplatePurchase_templateId_buyerId_key" ON "TemplatePurchase"("templateId", "buyerId");

-- CreateIndex
CREATE INDEX "StoreProduct_ownerId_status_idx" ON "StoreProduct"("ownerId", "status");

-- CreateIndex
CREATE INDEX "StoreProduct_podProvider_idx" ON "StoreProduct"("podProvider");

-- CreateIndex
CREATE UNIQUE INDEX "StoreProduct_ownerId_slug_key" ON "StoreProduct"("ownerId", "slug");

-- CreateIndex
CREATE INDEX "Order_sellerId_createdAt_idx" ON "Order"("sellerId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Order_buyerId_createdAt_idx" ON "Order"("buyerId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "Order"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_providerSubscriptionId_key" ON "Subscription"("providerSubscriptionId");

-- CreateIndex
CREATE INDEX "Subscription_userId_status_idx" ON "Subscription"("userId", "status");

-- CreateIndex
CREATE INDEX "CreditUsage_userId_createdAt_idx" ON "CreditUsage"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "CreditUsage_generationId_idx" ON "CreditUsage"("generationId");

-- CreateIndex
CREATE UNIQUE INDEX "AffiliateReferral_referredUserId_key" ON "AffiliateReferral"("referredUserId");

-- CreateIndex
CREATE INDEX "AffiliateReferral_referrerId_createdAt_idx" ON "AffiliateReferral"("referrerId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Payout_userId_status_idx" ON "Payout"("userId", "status");

-- CreateIndex
CREATE INDEX "BrandKit_userId_idx" ON "BrandKit"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "BrandKit_userId_name_key" ON "BrandKit"("userId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Review_orderId_key" ON "Review"("orderId");

-- CreateIndex
CREATE INDEX "Review_authorId_createdAt_idx" ON "Review"("authorId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Review_sellerId_idx" ON "Review"("sellerId");

-- CreateIndex
CREATE INDEX "Review_storeProductId_idx" ON "Review"("storeProductId");

-- CreateIndex
CREATE INDEX "Review_templateId_idx" ON "Review"("templateId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_referredById_fkey" FOREIGN KEY ("referredById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Design" ADD CONSTRAINT "Design_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Generation" ADD CONSTRAINT "Generation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Generation" ADD CONSTRAINT "Generation_designId_fkey" FOREIGN KEY ("designId") REFERENCES "Design"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mockup" ADD CONSTRAINT "Mockup_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mockup" ADD CONSTRAINT "Mockup_designId_fkey" FOREIGN KEY ("designId") REFERENCES "Design"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Template" ADD CONSTRAINT "Template_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Template" ADD CONSTRAINT "Template_designId_fkey" FOREIGN KEY ("designId") REFERENCES "Design"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplatePurchase" ADD CONSTRAINT "TemplatePurchase_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplatePurchase" ADD CONSTRAINT "TemplatePurchase_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplatePurchase" ADD CONSTRAINT "TemplatePurchase_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoreProduct" ADD CONSTRAINT "StoreProduct_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoreProduct" ADD CONSTRAINT "StoreProduct_designId_fkey" FOREIGN KEY ("designId") REFERENCES "Design"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoreProduct" ADD CONSTRAINT "StoreProduct_mockupId_fkey" FOREIGN KEY ("mockupId") REFERENCES "Mockup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_storeProductId_fkey" FOREIGN KEY ("storeProductId") REFERENCES "StoreProduct"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditUsage" ADD CONSTRAINT "CreditUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditUsage" ADD CONSTRAINT "CreditUsage_generationId_fkey" FOREIGN KEY ("generationId") REFERENCES "Generation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AffiliateReferral" ADD CONSTRAINT "AffiliateReferral_referrerId_fkey" FOREIGN KEY ("referrerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AffiliateReferral" ADD CONSTRAINT "AffiliateReferral_referredUserId_fkey" FOREIGN KEY ("referredUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payout" ADD CONSTRAINT "Payout_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payout" ADD CONSTRAINT "Payout_referralId_fkey" FOREIGN KEY ("referralId") REFERENCES "AffiliateReferral"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrandKit" ADD CONSTRAINT "BrandKit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_storeProductId_fkey" FOREIGN KEY ("storeProductId") REFERENCES "StoreProduct"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
