-- Add callToken for public QR URLs (/c/{callToken}).
-- Single ADD COLUMN backfills existing rows (volatile default runs per row).
ALTER TABLE "EventRoom" ADD COLUMN "callToken" TEXT NOT NULL DEFAULT CAST(gen_random_uuid() AS TEXT);

CREATE UNIQUE INDEX "EventRoom_callToken_key" ON "EventRoom"("callToken");
