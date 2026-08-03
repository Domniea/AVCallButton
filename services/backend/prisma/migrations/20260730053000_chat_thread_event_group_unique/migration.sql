-- Enforce one EVENT_GROUP thread per event (Prisma cannot express this partial unique in schema.prisma)
CREATE UNIQUE INDEX "ChatThread_event_group_eventId_key" ON "ChatThread"("eventId") WHERE "type" = 'EVENT_GROUP';
