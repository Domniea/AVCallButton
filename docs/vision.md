# Product vision (AV Call Button)

North-star notes. Keep lean; put active implementation detail in feature docs (e.g. [`room-alert-dashboard.md`](./room-alert-dashboard.md)).

## What it is today

Ops tool for live events: workspaces, events with zones/rooms, guest QR help calls, coverage-based push to crew, chat.

Core loop to prove next:

> Guest scans room QR → requests help → covered techs get notified → room shows red/yellow on a crew dash → tech resolves → room goes green.

Think **flight-attendant call button** for event production — fast, obvious, phone-friendly.

## Product principles

1. **Simple on the surface** — guest presses urgency + optional note; crew sees rooms, not a ticket system.
2. **Operational under the hood** — requests are permanent records; rooms show a live projection of open work.
3. **Industry-agnostic core** — models talk about rooms, alerts/requests, coverage, and response — not only “AV.” Production is the first vertical; hospitality/hotels can reuse the same spine.
4. **Don’t couple the UI to one department forever** — first recipients are AV techs via existing zone/room coverage; later House / other groups should not require a rewrite.
5. **Metrics matter later** — design so individual submissions and (eventually) underlying issues can be counted honestly; don’t fake merge for convenience.

## Near-term focus (Crew Room Alert Dashboard)

See **[`room-alert-dashboard.md`](./room-alert-dashboard.md)** for architecture, phases, and checklist.

- Multiple independently resolvable alerts per room
- Room color = highest active priority (`HIGH` red / `MEDIUM` yellow / none green)
- Same push strength for HIGH and MEDIUM; priority drives dash sort/color (copy can vary later)
- Reuse existing QR + coverage + push; add transactional room projection + crew dash UI

## Mid-term ideas (planned, not MVP)

| Idea | Intent |
| --- | --- |
| Request categories / types | Guest picks “Audio”, “Temp”, etc. Configurable per workspace later (not hardcoded AV enums) |
| Requester class | e.g. PRESENTER vs ATTENDEE — separate from urgency |
| Dual QR audiences | Trusted presenter/moderator path vs gated attendee path |
| Acknowledgment | Someone owns it; room can stay red while acknowledged |
| Department routing | Request type → responsible group → who is covering that group today |
| Temporary / external staff | Day-of house lead without full workspace membership; external notify later |

Keep these as **independent concepts** (don’t smash into one priority enum):

- **Urgency** — HIGH / MEDIUM  
- **Requester class** — presenter / attendee / staff / …  
- **Request category** — what kind of help  
- **Responsible group** — who should handle it  

## Longer-term opportunity (Event Intelligence)

Same request data can power org-level insights: issues by venue/room/department, response times, year-over-year, venue comparison. Normalize by attendance; respect data ownership across production company / client / venue.

Useful future split (not MVP):

| Layer | Meaning |
| --- | --- |
| Submission | One person tapped the QR and sent something |
| Issue / incident | Underlying problem (many submissions may map to one) |
| Operational alert | What crew actually acts on |

Attendee volume may need aggregation/gates so 9000 people don’t create 9000 pushes for “too warm.” Presenter/moderator paths stay higher trust. Thresholds and Issue grouping come **after** the basic alert loop works.

## Explicit non-goals for now

- Full department/SLA/escalation engine
- Hotel-specific workflows as first ship
- Org analytics dashboards
- Redis / separate projection service / event sourcing
- New microservices for alerts

## Related docs

- System today: [`architecture.md`](./architecture.md)
- Building the dash: [`room-alert-dashboard.md`](./room-alert-dashboard.md)
- Chat: [`chat-plan.md`](./chat-plan.md)
