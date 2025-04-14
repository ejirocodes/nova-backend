-- AlterTable
ALTER TABLE "prices" ADD COLUMN     "asset" TEXT NOT NULL DEFAULT 'bitcoin',
ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "historyData" JSONB,
ADD COLUMN     "percentChange24h" DOUBLE PRECISION,
ADD COLUMN     "period" TEXT,
ADD COLUMN     "priceChange24h" DOUBLE PRECISION;

-- CreateIndex
CREATE INDEX "prices_asset_period_idx" ON "prices"("asset", "period");
