# Architecture overview (AV Call Button)

Short map of the system for humans and agents. Keep this lean; put feature-specific plans in their own docs (e.g. [`chat-plan.md`](./chat-plan.md)).

## What the product is

Ops tool for live events: workspaces of staff, events with zones/rooms, guest QR help calls, and push alerts to covered crew/leads. Product direction: [`vision.md`](./vision.md). Active room-alert / crew-dash build: [`room-alert-dashboard.md`](./room-alert-dashboard.md). Chat: [`chat-plan.md`](./chat-plan.md).

## Monorepo layout

Yarn workspaces + Turborepo.

| Path | Role |
| --- | --- |
| `apps/mobile` | Expo (dev client / EAS), React Native, Native Base, React Navigation |
| `apps/web` | Next.js App Router, Chakra UI, Amplify auth UI |
| `services/backend` | SST v2 API (API Gateway + Lambda), Prisma, push |
| `packages/store` | Redux store, API clients (axios), shared thunks |
| `packages/auth-client` | Amplify auth helpers used by apps |
| `packages/auth-core` | Shared auth utilities for backend |
| `packages/forms` / `packages/ui` | Shared form/UI pieces |

## Runtime stack

```text
┌─────────────┐     ┌─────────────┐
│ Expo mobile │     │  Next web   │
│ Amplify RN  │     │ Amplify web │
└──────┬──────┘     └──────┬──────┘
       │  JWT (Cognito)    │
       └─────────┬─────────┘
                 ▼
        SST API (Lambda)
                 │
       ┌─────────┼─────────┬─────────┐
       ▼         ▼         ▼         ▼
   Postgres     SES      Push        S3
   (Prisma)    email   (Expo +     private
                       web-push)   buckets
```

- **Auth:** AWS Cognito via Amplify; API JWT authorizer on most routes
- **DB:** PostgreSQL (Neon in practice) via Prisma
- **API:** SST stages — `local` (`sst dev`), `dev` (`yarn deploy`), `prod` (`deploy:prod`)
- **Files:** SST `StorageStack` — private S3 (`Uploads`, `Generated`); access via presigned URLs (not public objects)
- **Web host:** Vercel (`av-call-button-web.vercel.app` in CORS / app URL)
- **Mobile:** Expo + EAS builds; physical device required for real push

## Domain model (core)

```text
Workspace
  └── Membership (user ↔ workspace + role)
  └── Event
        ├── EventAssignment / EventInvite (who’s on the event)
        ├── EventZone
        │     └── EventZoneCoverage
        ├── EventRoom (callToken for guest QR)
        │     └── EventRoomCoverage
        ├── Alert (help requests)
        └── File (S3 metadata; room docs, later event packs / avatars)
DeviceToken (IOS | ANDROID | WEB push endpoints)
```

Guest flow: public `GET/POST /public/call/{callToken}/…` (no auth) → create `Alert` → resolve recipients (room/zone coverage + leads) → `notifyUsers`.

Calls are gated by event status / end time (`isEventAcceptingCalls`).

**Room status direction:** Alert remains the permanent record; `EventRoom` will hold a transactional current-state projection (`currentPriority`, etc.) for the crew dash. Details: [`room-alert-dashboard.md`](./room-alert-dashboard.md).

## Notifications (today)

1. Client registers token → `POST /me/device-tokens`
2. Help alert (or `POST /me/push/test`) → `notifyUsers`
3. Fanout:
   - **IOS/ANDROID** → Expo push
   - **WEB** → VAPID / `web-push` + service worker (`apps/web/public/sw.js`)
4. Stale tokens (404/410 / Expo `DeviceNotRegistered`) are deleted

Account/settings UIs can enable notifications and send a test ping (web + mobile).

OS-level notification settings (e.g. macOS → Chrome) are outside the app’s control.

## Frontend patterns

- Shared state/API in `@av/store`
- Web: Chakra + `next-themes`; toaster exists for in-app toasts (not OS push)
- Mobile: Native Base + navigation stacks/tabs
- Env: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `NEXT_PUBLIC_APP_URL` (guest QR/links); backend `DATABASE_URL`, `VAPID_*`

## Deploy / env cheat sheet

| Concern | Typical |
| --- | --- |
| Local API | `sst dev --stage local` → API Gateway URL in SST outputs |
| Shared/dev API | `yarn workspace @av/backend deploy` (stage `dev`) |
| Web local → deployed API | `apps/web` `.env` / `.env.local` `NEXT_PUBLIC_API_URL` |
| Guest call links | `apps/web/lib/callLinks.ts` + `NEXT_PUBLIC_APP_URL` |
| Prisma | run from `services/backend` (`prisma:migrate`, `prisma:generate`) |
| S3 | created by `StorageStack` on `sst dev` / `sst deploy`; names in SST outputs |

## Planned / in progress features

| Feature | Doc |
| --- | --- |
| Room alert crew dashboard | [`room-alert-dashboard.md`](./room-alert-dashboard.md) |
| Chat (event / zone / DM) | [`chat-plan.md`](./chat-plan.md) |

## How to use this in a new chat

> Read `docs/architecture.md` for system context. For product direction, `docs/vision.md`. For room alerts / crew dash, follow `docs/room-alert-dashboard.md`. For chat, follow `docs/chat-plan.md`. See also [`docs/README.md`](./README.md).
