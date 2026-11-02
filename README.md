# AV Call Button

Ops tool for live events: workspaces, events, rooms/zones, guest QR help calls, and push alerts to covered crew.

This README is the “I stepped away for a few months” guide. For deeper system maps, see [`docs/architecture.md`](./docs/architecture.md).

---

## What lives where

| Folder | What it is |
| --- | --- |
| `apps/web` | Next.js website (admin + guest call pages) |
| `apps/mobile` | Expo / React Native iOS & Android app |
| `services/backend` | API (SST + Lambda), database (Prisma), email/push |
| `packages/*` | Shared code (auth, Redux store, forms, UI) |

**Rule of thumb:** run everyday commands from the **repo root**. The real scripts live in each app; root just `cd`s into the right folder and runs them.

---

## One-time / returning setup

You need:

- Node 20+
- Yarn 1 (`yarn@1.22.22`)
- Xcode + iOS Simulator (for mobile)
- AWS credentials that can talk to Cognito / deploy SST
- Local env files (not in git):
  - `services/backend/.env` — at least `DATABASE_URL`
  - `apps/web/.env` — at least `NEXT_PUBLIC_API_URL`
  - `apps/mobile/.env` — at least `EXPO_PUBLIC_API_URL`

Then from the repo root:

```sh
yarn setup
```

That installs dependencies, generates the Prisma client, and **optionally** offers a database nuke.

Force the nuke prompt path:

```sh
yarn setup:nuke
```

### What “nuke” does (and does not)

| Nuke **does** | Nuke **does not** |
| --- | --- |
| Wipe Postgres data and recreate empty tables | Delete Cognito login users |
| Clear non-prod upload/generated files (if those stacks exist) | Remove your AWS Cognito pool |

**Important:** Cognito users are left alone on purpose. If you nuke the DB but keep signing in with the same Cognito account, the API will recreate a **personal workspace** (plus membership + default roles) the next time that user hits `GET /workspaces`.

For a truly empty slate (feel like brand-new users again):

1. Run `yarn db:nuke` (or say yes during `yarn setup`)
2. Delete users in the **AWS Cognito user pool** console  
   Pool id is hard-coded in `services/backend/stacks/ApiStack.ts`
3. Sign up again in the app

You can also run nuke alone anytime:

```sh
yarn db:nuke
```

---

## How to run things day to day

Open **separate terminals**. Most flows need the API plus one client.

### 1. Backend API (required for real data)

```sh
yarn backend:dev
```

This runs `sst dev --stage local` inside `services/backend`. Leave it running. SST prints an **API Gateway URL** — that is your local API.

Point the clients at it:

- Web: `NEXT_PUBLIC_API_URL` in `apps/web/.env`
- Mobile: `EXPO_PUBLIC_API_URL` in `apps/mobile/.env`

If you would rather talk to the **already deployed** API (shared `dev` stage), skip `backend:dev` and set those URLs to the deployed API instead.

### 2. Web app

```sh
yarn web
```

Opens Next.js (usually http://localhost:3000).

Other web helpers:

```sh
yarn web:build      # production build
yarn web:start      # serve that build
yarn web:dev:env    # next dev with apps/web/.env explicitly loaded
```

### 3. iOS app

Two different commands — easy to mix up:

| Command | When to use |
| --- | --- |
| `yarn ios` | **Build / install** native app on the Simulator (first time, or after native/dependency changes) |
| `yarn ios:start` | **Day to day** — boot Simulator + Metro when the app is already installed |

```sh
yarn ios          # compile + install + launch
yarn ios:start    # just run Metro against the installed app
```

Android mirrors that: `yarn android` / `yarn android:start`.

**Simulator tip:** soft-keyboard haptic warnings (`hapticpatternlibrary.plist`, `CHHapticPattern`, etc.) are Simulator noise, not your app crashing. Toggle **I/O → Keyboard → Connect Hardware Keyboard** (`Cmd+Shift+K`) to quiet them.

---

## Auth, personal workspace, and org workspace

- Sign up / login go through **AWS Cognito** (Amplify in the apps).
- There is **no User table** for “accounts” in Postgres. Cognito owns logins.
- On first workspace list after login, the API ensures a **personal** workspace for that Cognito user (`type: "personal"`), with default roles (GUEST → OWNER) and an owner membership.

### Corporate / org workspace

Backend is ready: `POST /workspaces/org` with `{ "name": "Acme AV" }` and a Cognito ID token.

**UI is not built yet** (web dashboard and mobile workspace list only show workspaces; they don’t create orgs). Until there is a button, create one with curl (or any HTTP client) while signed in:

```sh
curl -X POST "$API_URL/workspaces/org" \
  -H "Authorization: Bearer $ID_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Acme AV"}'
```

Reload the dashboard / workspace list afterward. You will be the org **owner**.

---

## Deploying the API

Stages (SST):

| Stage | Command (from root) | Typical use |
| --- | --- | --- |
| `local` | `yarn backend:dev` | Laptop live-reload API |
| `dev` | `yarn backend:deploy` | Shared deployed API for clients |
| `prod` | `yarn backend:deploy:prod` | Production — be careful |

Same thing from the backend folder:

```sh
cd services/backend
yarn dev              # local
yarn deploy           # stage: dev
yarn deploy:prod      # stage: prod
```

After deploy, update client env URLs if the API URL changed, then restart web / rebuild or reload mobile.

**Web hosting** is separate (Vercel for the Next app). Deploying the API does not deploy the website, and vice versa.

**Database migrations** when schema changes:

```sh
yarn prisma:migrate     # local / interactive migrate
yarn prisma:generate    # regenerate client after schema changes
```

On deployed environments you usually apply with Prisma migrate deploy from `services/backend` (see `prisma:migrate:deploy` there).

---

## Root command cheat sheet

```sh
yarn setup                 # install + prisma generate + optional nuke
yarn setup:nuke            # same, and offer / run nuke

yarn backend:dev           # local SST API
yarn backend:deploy        # deploy API to stage "dev"
yarn backend:deploy:prod   # deploy API to stage "prod"

yarn web                   # Next.js dev
yarn ios                   # native iOS build + install
yarn ios:start             # iOS Metro only
yarn android
yarn android:start

yarn db:nuke               # wipe DB (not Cognito)
yarn prisma:migrate
yarn prisma:generate
```

You can still `cd apps/web`, `cd apps/mobile`, or `cd services/backend` and run the same script names there if you prefer.

---

## Mental model for “empty slate”

```text
yarn db:nuke
        │
        ├─► Postgres empty          ✅
        └─► Cognito users remain    ⚠️

Still signed in with old Cognito user?
        │
        └─► App loads workspaces → API recreates personal workspace
```

Want new users from scratch → nuke **and** delete Cognito users, then sign up again.

---

## More detail

- System map: [`docs/architecture.md`](./docs/architecture.md)
- Chat plan: [`docs/chat-plan.md`](./docs/chat-plan.md)
