import type { APIGatewayProxyHandlerV2WithJWTAuthorizer } from "aws-lambda";

import { publishAlertBoardInvalidated } from "../../lib/alerts/ably";
import { formatAlert } from "../../lib/alerts/formatAlert";
import { resolveRoomAlert } from "../../lib/alerts/resolveRoomAlert";
import { assertRosterEntry } from "../../lib/assertRosterEntry";
import { badRequest, forbidden, notFound, serverError } from "../../lib/responses";

export const handler: APIGatewayProxyHandlerV2WithJWTAuthorizer = async (
  event,
) => {
  try {
    const claims = event.requestContext.authorizer.jwt.claims;
    const userId = claims.sub as string;

    const eventId = event.pathParameters?.eventId?.trim();
    const alertId = event.pathParameters?.alertId?.trim();
    if (!eventId) return badRequest("Missing event id");
    if (!alertId) return badRequest("Missing alert id");

    await assertRosterEntry(userId, eventId);

    const { alert, projection, alreadyResolved } = await resolveRoomAlert({
      eventId,
      alertId,
      resolvedBy: userId,
    });

    if (!alreadyResolved) {
      await publishAlertBoardInvalidated({
        eventId,
        roomId: alert.roomId,
        alertId: alert.id,
        action: "resolved",
        updatedAt: new Date().toISOString(),
      });
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        alreadyResolved,
        alert: formatAlert(alert),
        room: {
          id: alert.roomId,
          currentPriority: projection.currentPriority,
          currentAlertId: projection.currentAlertId,
          activeAlertCount: projection.activeAlertCount,
          statusUpdatedAt: projection.statusUpdatedAt?.toISOString() ?? null,
        },
      }),
    };
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "NOT_ON_ROSTER") {
        return forbidden("Not on event roster");
      }
      if (error.message === "ALERT_NOT_FOUND") {
        return notFound("Alert not found");
      }
      if (error.message === "ROOM_NOT_FOUND") {
        return notFound("Room not found");
      }
    }
    console.error("Failed to resolve alert:", error);
    return serverError("Failed to resolve alert");
  }
};
