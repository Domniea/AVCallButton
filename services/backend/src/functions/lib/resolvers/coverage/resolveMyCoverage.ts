type CoverageRoom = {
  id: string;
  name: string;
  eventRank: number;
};

type CoverageZone = {
  id: string;
  name: string;
  eventRank: number;
  rooms: CoverageRoom[];
  alertSummary: { active: number; pending: number };
};

type ZoneCoverageRow = {
  zoneId: string;
  eventRank: number;
  zone: { id: string; name: string; sortOrder: number };
};

type RoomCoverageRow = {
  eventRank: number;
  room: {
    id: string;
    name: string;
    zoneId: string | null;
    sortOrder: number;
    zone: { id: string; name: string; sortOrder: number } | null;
  };
};

type EventRoomRow = {
  id: string;
  name: string;
  zoneId: string | null;
  sortOrder: number;
};

export type ResolveMyCoverageParams = {
  zoneCoverageRows: ZoneCoverageRow[];
  roomCoverageRows: RoomCoverageRow[];
  eventRooms: EventRoomRow[];
};

function sortRoomsByOrder(
  rooms: CoverageRoom[],
  eventRooms: EventRoomRow[],
): CoverageRoom[] {
  return [...rooms].sort((a, b) => {
    const aOrder = eventRooms.find((room) => room.id === a.id)?.sortOrder ?? 0;
    const bOrder = eventRooms.find((room) => room.id === b.id)?.sortOrder ?? 0;
    return aOrder - bOrder || a.name.localeCompare(b.name);
  });
}

function zoneSortOrder(
  zoneId: string,
  zoneCoverageRows: ZoneCoverageRow[],
  roomCoverageRows: RoomCoverageRow[],
): number {
  return (
    zoneCoverageRows.find((row) => row.zone.id === zoneId)?.zone.sortOrder ??
    roomCoverageRows.find((row) => row.room.zone?.id === zoneId)?.room.zone
      ?.sortOrder ??
    0
  );
}

/**
 * Zone coverage includes every room in that zone at runtime.
 * Room-only coverage applies when there is no zone coverage row for that zone.
 */
export function resolveMyCoverage(params: ResolveMyCoverageParams): {
  zones: CoverageZone[];
  roomsWithoutZone: CoverageRoom[];
} {
  const { zoneCoverageRows, roomCoverageRows, eventRooms } = params;
  const zonesWithFullCoverage = new Set(
    zoneCoverageRows.map((row) => row.zoneId),
  );

  const roomOnlyByZoneId = new Map<string, CoverageRoom[]>();
  const roomsWithoutZone: CoverageRoom[] = [];

  for (const row of roomCoverageRows) {
    const room: CoverageRoom = {
      id: row.room.id,
      name: row.room.name,
      eventRank: row.eventRank,
    };

    if (row.room.zoneId == null) {
      roomsWithoutZone.push(room);
      continue;
    }

    if (zonesWithFullCoverage.has(row.room.zoneId)) {
      continue;
    }

    const existing = roomOnlyByZoneId.get(row.room.zoneId) ?? [];
    existing.push(room);
    roomOnlyByZoneId.set(row.room.zoneId, existing);
  }

  const zoneMap = new Map<string, CoverageZone>();

  for (const row of zoneCoverageRows) {
    const rooms = eventRooms
      .filter((room) => room.zoneId === row.zoneId)
      .map((room) => ({
        id: room.id,
        name: room.name,
        eventRank: row.eventRank,
      }));

    zoneMap.set(row.zoneId, {
      id: row.zone.id,
      name: row.zone.name,
      eventRank: row.eventRank,
      rooms: sortRoomsByOrder(rooms, eventRooms),
      alertSummary: { active: 0, pending: 0 },
    });
  }

  for (const [zoneId, rooms] of roomOnlyByZoneId) {
    const zone =
      roomCoverageRows.find((row) => row.room.zoneId === zoneId)?.room.zone ??
      null;
    if (!zone) continue;

    zoneMap.set(zoneId, {
      id: zone.id,
      name: zone.name,
      eventRank: rooms[0]?.eventRank ?? 0,
      rooms: sortRoomsByOrder(rooms, eventRooms),
      alertSummary: { active: 0, pending: 0 },
    });
  }

  const zones = [...zoneMap.values()].sort(
    (a, b) =>
      zoneSortOrder(a.id, zoneCoverageRows, roomCoverageRows) -
        zoneSortOrder(b.id, zoneCoverageRows, roomCoverageRows) ||
      a.name.localeCompare(b.name),
  );

  return {
    zones,
    roomsWithoutZone: sortRoomsByOrder(roomsWithoutZone, eventRooms),
  };
}

export function countMyCoverageSummary(
  params: ResolveMyCoverageParams,
): { zoneCount: number; roomCount: number } {
  const { zones, roomsWithoutZone } = resolveMyCoverage(params);

  const roomIds = new Set<string>();
  for (const zone of zones) {
    for (const room of zone.rooms) {
      roomIds.add(room.id);
    }
  }
  for (const room of roomsWithoutZone) {
    roomIds.add(room.id);
  }

  return {
    zoneCount: zones.length,
    roomCount: roomIds.size,
  };
}
