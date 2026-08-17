-- Restore partial unique dropped by 20260817012644_file_table
-- (Prisma cannot express this in schema.prisma; it is SQL-only.)
CREATE UNIQUE INDEX IF NOT EXISTS "ChatThread_event_group_eventId_key" ON "ChatThread"("eventId") WHERE "type" = 'EVENT_GROUP';
