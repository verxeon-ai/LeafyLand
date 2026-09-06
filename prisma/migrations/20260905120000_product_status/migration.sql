-- AlterTable
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'approved';

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Product_status_idx" ON "Product"("status");
