-- Rename Show -> Event; showId -> eventId on Log and Message
ALTER TABLE "Show" RENAME TO "Event";

ALTER TABLE "Event" RENAME CONSTRAINT "Show_pkey" TO "Event_pkey";
ALTER TABLE "Event" RENAME CONSTRAINT "Show_workspaceId_fkey" TO "Event_workspaceId_fkey";

ALTER INDEX "Show_workspaceId_idx" RENAME TO "Event_workspaceId_idx";
ALTER INDEX "Show_status_idx" RENAME TO "Event_status_idx";
ALTER INDEX "Show_startTime_idx" RENAME TO "Event_startTime_idx";

ALTER TABLE "Log" RENAME COLUMN "showId" TO "eventId";
ALTER TABLE "Log" RENAME CONSTRAINT "Log_showId_fkey" TO "Log_eventId_fkey";
ALTER INDEX "Log_showId_idx" RENAME TO "Log_eventId_idx";

ALTER TABLE "Message" RENAME COLUMN "showId" TO "eventId";
ALTER TABLE "Message" RENAME CONSTRAINT "Message_showId_fkey" TO "Message_eventId_fkey";
ALTER INDEX "Message_showId_idx" RENAME TO "Message_eventId_idx";
