# Room Alert Dashboard MVP

Use this doc to keep alert / crew-dash work consistent across sessions.  
**Inspect existing code first. Ask before big detours.** Update **Status** as work lands.

Companion vision: [`vision.md`](./vision.md) · System map: [`architecture.md`](./architecture.md)

## Goal (test this first)

Two phones, one loop:

1. Guest scans room QR → picks **Need help now (HIGH)** or **When available (MEDIUM)** → optional message  
2. Covered AV techs get existing push  
3. Crew dash shows room **red / yellow** with active request count  
4. Tech opens room → sees multiple requests → resolves one independently  
5. When last active alert is resolved → room **green**

That is the whole MVP. Future House / attendee aggregation / analytics must stay *possible*, not *built*.

## Architecture (decided)

Hybrid: **Alert = source of truth**, **EventRoom = current-state projection**, **Zone status = derived at read time**.

```text
Guest QR (HIGH | MEDIUM + optional message)
        │
        ▼
 PostgreSQL transaction
   ├── Alert (permanent, room-scoped)
   └── EventRoom projection (currentPriority, currentAlertId, …)
        │
        ▼ (after commit)
 Notify covered techs (existing push)
 Update crew dash (poll / existing realtime later)
```

This is lightweight CQRS / transactional denormalization — not full CQRS or event sourcing.

### Alert (permanent)

- One guest request → one `Alert` row (multiple active alerts per room allowed)
- `priority`: `HIGH` | `MEDIUM`
- `status`: `OPEN` | `ACKNOWLEDGED` | `RESOLVED` (MVP may only *use* OPEN + RESOLVE in UI)
- Optional message; soft-close via resolve (never hard-delete for “clear”)
- **Active** = `OPEN` **or** `ACKNOWLEDGED` (ack ≠ clear)
- Priority and acknowledgment are independent (room can be red *and* acknowledged)
- Optional future-ready nullable fields only if cheap: `requestTypeId`, `requesterType`, `responsibleGroupId` — **no new category/department tables in MVP**

### EventRoom projection (cache only)

Suggested fields:

- `currentPriority`: `HIGH` | `MEDIUM` | `null` (null = GREEN)
- `currentAlertId`: driving active alert (or null)
- `statusUpdatedAt` (optional)
- `activeAlertCount` (optional)

**Projection rules**

| Active alerts | Room |
| --- | --- |
| None | GREEN |
| ≥1 MEDIUM, no HIGH | YELLOW |
| ≥1 HIGH | RED |

- HIGH outranks MEDIUM  
- Driving alert = **oldest active at the highest priority** (not latest-wins; newer MEDIUM must not hide older HIGH)  
- Resolving HIGH while MEDIUM remains → YELLOW  
- Zone severity = max of its rooms’ priorities — **do not store zone alert status**

### Consistency / concurrency

1. Lock room row (`FOR UPDATE` or equivalent)  
2. Create/update Alert  
3. Query active alerts for room  
4. Recompute projection  
5. Commit  

Every mutation path (create, resolve, later ack) shares this helper.  
**Do not** send Expo/Ably/web-push inside the DB transaction — commit first, then notify (outbox later if retries need hardening).

### Explicitly do **not** build

- Separate `FlaggedRoom` / `RoomAlert` table  
- Authoritative status on Zone  
- Tiered push by priority  
- House routing, dual QR audiences, attendee aggregation, analytics, SLA/escalation  
- New realtime provider if existing stack can carry updates  

## MVP UI sketch (crew phone)

- Event rooms list: filters/counts for Urgent / Pending / Clear  
- Sort: RED → YELLOW → GREEN; within band, oldest outstanding first  
- Room card: name, zone, color + text, active count, age / message preview  
- Room detail: list active alerts → Resolve per alert  
- Color alone is not enough — pair with icon/text for accessibility  

Labels: prefer **Crew Dashboard** / Alert / Coverage over hardcoding “AV-only” in the data model.

## Build phases

### Phase 0 — Inspect

- Prisma: `Alert`, `EventRoom`, zones, coverage, auth  
- Public QR create-alert path + rate limits  
- Push + recipient resolution  
- Existing crew/event dash screens  

Deliverable: short note in Status / PR of what exists vs what changes. No parallel architecture.

### Phase 1 — Data model

- Add priority + clearer status (+ ack/resolve actor timestamps as needed)  
- Add EventRoom projection fields  
- Migration + backfill so existing OPEN alerts don’t leave rooms falsely GREEN  

### Phase 2 — Transactional services

- Shared create/resolve (+ later ack) helpers with room lock + projection recompute  
- Guest create uses them; resolve API for authenticated crew  
- Idempotency / double-submit protection; do **not** auto-merge distinct guest requests  

### Phase 3 — Guest QR UX

- HIGH / MEDIUM choice + optional message on existing guest flow  
- Same heavy push for both; confirm after submit  

### Phase 4 — Crew Dashboard UI

- Room cards from projection; room detail with active alerts + resolve  
- Zone grouping OK; zone color derived  
- AuthZ: public QR create only; crew read/resolve only authorized rooms/events  

### Phase 5 — Live updates

- After commit: push via existing path; dash refetch / existing realtime if available  
- Event-level subscription preferred over per-room  
- Missed events must not leave a stale board (reconnect/refetch fallback)  

### Phase 6 — Hardening

- Concurrent same-room creates  
- Partial resolve leaves correct color  
- Failed push does not roll back alert  
- Resolved rows remain in DB  

## Acceptance criteria (MVP done when)

- [ ] Guest can HIGH/MEDIUM page via room QR  
- [ ] Covered techs get existing push  
- [ ] Dash shows correct red/yellow/green + counts  
- [ ] Multiple alerts per room; independent resolve  
- [ ] Last resolve → green; history retained  
- [ ] Projection stays consistent under concurrent writes  
- [ ] Unauthorized resolve blocked  

## Milestone demo

Scan QR on phone A → submit → phone B dash updates → resolve → dash returns green.

## Future hooks (document only — out of scope)

See [`vision.md`](./vision.md): request types, presenter vs attendee QR, submission vs issue vs alert, org analytics, team-filtered dashboards. Prefer nullable columns / unused enums over new services until a real test event needs them.

## How to use this in a new chat

> Follow `docs/room-alert-dashboard.md`. Implement the next open Phase. Ask before big detours. Check off Status items when done.

## Status

- [ ] Phase 0 — Inspect existing Alert / QR / coverage / dash; note gaps  
- [ ] Phase 1 — Prisma: Alert priority/status fields + EventRoom projection + migration/backfill  
- [ ] Phase 2 — Shared transactional create/resolve + room lock + projection helper  
- [ ] Phase 3 — Guest QR: HIGH / MEDIUM + optional message  
- [ ] Phase 4 — Crew Dashboard UI (list + room active alerts + resolve)  
- [ ] Phase 5 — Post-commit push + dash live/refetch behavior  
- [ ] Phase 6 — Concurrency / auth / acceptance tests  
- [ ] Demo milestone: two devices, full green→red/yellow→green loop  

### Decisions log

| Date | Decision |
| --- | --- |
| 2026-11 | Hybrid Alert truth + EventRoom projection; zone derived |
| 2026-11 | Multiple independently resolvable alerts per room |
| 2026-11 | Same push strength for HIGH and MEDIUM |
| 2026-11 | OPEN + ACKNOWLEDGED = active; ack does not clear room color |
| 2026-11 | Highest priority wins; oldest at that priority is driving alert |
| 2026-11 | MVP = production call-button loop; categories / House / attendee gates later |
| 2026-11 | Keep urgency, requester class, category, responsible group as separate future concepts |
