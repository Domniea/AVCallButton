# Chat system plan (AV Call Button)

Use this doc to keep chat work consistent across sessions.  
**Start with Phase 1–2 against current schema/conventions. Ask before big detours.**

## Stack

Expo mobile + Next web + SST/Lambda + Prisma/Postgres + existing Expo/web push.

## Goals

1. **Event group chat** — one main thread per event (all assigned staff)
2. **Zone chats** — one thread per event zone (~20 zones typical)
3. **DMs** — 1:1 between users who share a workspace/event
4. **Realtime via Ably** (Free tier OK for ~60 concurrent + zone channels + light DMs)
5. **Postgres = source of truth**; Ably = live fanout; existing push = offline fallback

## Constraints / context

- Not building Slack; efficient direct ops communication
- Mostly mobile↔mobile; web also supported
- Scale estimate: ~60 connected per event, ~20 zone chats, some DMs
- Existing stub: Prisma `Message` model is event-scoped only — evolve to threads
- Membership should follow `EventAssignment` / zone coverage where it makes sense
- Event end should stop accepting noisy chat pushes later (same spirit as call gating)

## Architecture

Follow unless there is a strong reason not to:

| Piece | Role |
| --- | --- |
| Postgres + Prisma | Permanent history, membership, read state |
| Ably | Live delivery (`thread:{id}` channels) |
| Expo / web push | Offline / background interrupt |

### Data model

- `ChatThread`: type `EVENT_GROUP` \| `ZONE` \| `DM`
- `ChatThreadMember`: `userId`, `lastReadMessageId?`, `mutedUntil?`
- `ChatMessage`: `threadId`, `senderId`, `body`, timestamps, soft delete

### Uniqueness / rules

- One `EVENT_GROUP` per `eventId`
- One `ZONE` thread per `zoneId`
- DM pair uniqueness per event (`eventId` + sorted user `dmKey`)
- **DMs:** both users must be on the same **event roster** (`eventId` required). Inbox is event-scoped (group + zone + DM).
- `ChatThreadMember.status` uses `MembershipStatus` (`ACTIVE` \| `INACTIVE`); APIs require `ACTIVE`
- API writes to Postgres **first**, then publishes to Ably channel `thread:{id}`
- Clients subscribe with **Ably token auth from our backend** (never expose root API key)
- Reuse `DeviceToken` + `notifyUsers` path for offline push (optional later phase)

### Mental model

```text
Client send → Lambda API → Postgres (truth)
                         → Ably publish → connected clients
                         → push (if offline / later phase)
```

## Preferred build route

### Phase 1 — Data model

Replace/evolve stub `Message` into:

- `ChatThread` (`EVENT_GROUP` \| `ZONE` \| `DM`)
- `ChatThreadMember`
- `ChatMessage`

Hooks:

- Event created → create `EVENT_GROUP` thread
- Zone created → create `ZONE` thread; add all roster leads+ (eventRank ≥ 6)
- Assign staff → add to event group; leads+ also join every zone thread; covered crew join their zone thread
- DM → `getOrCreate` by sorted user pair + event

### Phase 2 — REST APIs (no Ably yet)

- `GET` / `POST` messages by thread
- `GET` inbox (threads)
- `POST` read receipts
- Ship with refresh/polling so chat works before realtime

### Phase 3 — Ably

- `POST /chat/ably-token` (authenticated)
- On message create: save DB → `ably.channels.get('thread:' + id).publish(...)`
- Clients subscribe only to threads they are members of

### Phase 4 — Mobile UI first

- Event screen → Event chat
- `ZoneDetail` → Zone chat
- Chat tab / inbox → DMs + recent threads

### Phase 5 — Web UI parity

Same threads and APIs as mobile.

### Phase 6 — Polish

- Offline push for new messages when not connected
- Mute / snooze
- Quiet after event end

## Non-goals (v1)

- DIY WebSocket farm on Lambda
- Full Slack feature set (reactions, threads-of-threads, rich presence, etc.)
- Separate chat databases for mobile vs web
- Global DMs with no workspace/event relationship

## How to use this in a new chat

> Follow `docs/chat-plan.md`. Implement Phase N. Ask before big detours.

## Status

- [x] Phase 1 — Data model (tables + migration)
- [x] Phase 1 — Lifecycle hooks (event/zone/assign → threads/members)
- [x] Phase 1 — DM `getOrCreate` helper
- [x] Phase 2 — REST APIs + polling
  - [x] GET / POST messages by threadId
  - [x] POST read receipts
  - [x] GET inbox
  - [x] POST open DM
- [x] Phase 3 — Ably token + publish
  - [x] POST /chat/ably-token (+ store client)
  - [x] Publish on message create
  - [x] Mobile subscribe
- [x] Phase 4 — Mobile UI
  - [x] Store API clients (`@av/store` chat.api)
  - [x] Chat tab inbox (workspaceId + eventId via lastSession)
  - [x] Thread screen (list / send / mark read / before + after poll)
  - [x] New DM flow (event roster → POST /chat/dms)
- [ ] Phase 5 — Web UI
- [ ] Phase 6 — Push / mute / event-end quieting
