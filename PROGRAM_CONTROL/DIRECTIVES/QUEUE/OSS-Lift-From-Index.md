# OSS Lift-From Index

> **Companion to** `PROGRAM_CONTROL/DIRECTIVES/QUEUE/OSS-Repo-Registry.md`

| Field | Value |
|---|---|
| **Document ID** | `REF-LIB-OSS-LIFT-01` |
| **Authored** | 21 April 2026 |
| **Revised** | 21 April 2026 (v1.2 — flat QUEUE/ paths) |
| **Status** | DRAFT v1.2 — pending CEO review |
| **Owner** | Kevin B. Hartley, CEO / Creative Director |
| **Location** | `PROGRAM_CONTROL/DIRECTIVES/QUEUE/OSS-Lift-From-Index.md` |

---

## 1. Purpose

This index closes the gap between the Thread 15 OSS harvest — which placed nine third-party repositories onto isolated `refs/oss/*` branches in `OmniQuestMediaInc/ChatNowZone--BUILD` — and the consuming directives that will eventually draw from them.

Without this document, future Claude Code (Droid) sessions executing **CCZ-004**, **DISC-001/004**, **FC-001–006**, **CCZ-001/002** and adjacent directives would not know which branch to consult, what to lift, what to discard, or what licensing constraints apply.

This document tells them exactly that, on a per-branch basis.

---

## 2. Critical Finding — Licensing Gap

> ### 🚨 SEV-2 GOVERNANCE GAP
>
> The Thread 15 BRANCH MANIFEST recorded all nine source repos as MIT-licensed. Direct verification on 21 April 2026 found that **only two of the nine actually carry an explicit license file**:
>
> - `next_discussion_platform` — **MIT** (LICENSE present)
> - `mahseema/free-ai-resources` — **MIT** (curated link list, not executable code)
>
> The remaining **seven CelaDaniel repositories carry NO LICENSE file**. Under default copyright law, this means "all rights reserved" — reading the source is fine, but porting any non-trivial portion of code into our `main` branch without explicit permission would create copyright exposure.
>
> **Treatment:** those seven branches are reclassified as **PATTERN-REFERENCE-ONLY**. The CI block that prevents `refs/oss/*` → `main` merges remains the correct enforcement; this index documents *why* each branch must stay there. Clean-room reimplementation only — read the shape, write our own code.

---

## 3. Branch Inventory

All nine branches at a glance. Detailed cards follow in Section 5.

| # | Branch | Source | License | Status | Consuming Directives |
|---|---|---|---|---|---|
| 1 | `refs/oss/booking-api` | `CelaDaniel/Full-Stack-Booking-Management-API` | NONE DETECTED | 🔴 BLOCKED | CCZ-004, DISC-001, DISC-004 |
| 2 | `refs/oss/socketio-chat` | `CelaDaniel/nodejs-socketio-chat-application` | NONE DETECTED | 🔴 BLOCKED | OBS-001, OBS-002, CCZ-001 |
| 3 | `refs/oss/react-chat-app` | `CelaDaniel/React-Chat-App` | NONE DETECTED | 🔴 BLOCKED | CCZ-001, CCZ-002 |
| 4 | `refs/oss/discussion-platform` | `CelaDaniel/next_discussion_platform` | **MIT** | 🟢 CLEAR | FC-001 → FC-006, OPS-004 |
| 5 | `refs/oss/live-polling` | `CelaDaniel/react-polling` | NONE DETECTED | 🔴 BLOCKED | OBS Room-Heat Engine |
| 6 | `refs/oss/zoom-clone` | `CelaDaniel/zoom-clone` | NONE DETECTED | 🔴 BLOCKED | OBS Theatre UI, DISC series |
| 7 | `refs/oss/loadbalancer-nginx` | `CelaDaniel/loadbalancer-nginx-docker-nodejs` | NONE DETECTED | 🔴 BLOCKED | Bijou SFU infra |
| 8 | `refs/oss/social-media-app` | `CelaDaniel/Social-media-react-app` | NONE DETECTED | 🔴 BLOCKED | FC-003, CCZ-003 |
| 9 | `refs/oqminc/ai-resources` | `mahseema/free-ai-resources` | **MIT** | 🟢 CLEAR (link list) | OBS-005, HZ, NN-001, NN-002, DFSP |

---

## 4. Lift Policy by License Status

### 4.1 🟢 CLEAR (MIT) — direct port permitted

- Files **may** be copied into `main` with the original `LICENSE` preserved alongside them.
- A NOTICE entry **must** be added to `PROGRAM_CONTROL/DIRECTIVES/QUEUE/OSS-Attributions.md` (to be created by the first directive that actually ports a file).
- Any meaningful modification must be recorded in the file header per OQMI Coding Doctrine.
- **Currently applies to:** `refs/oss/discussion-platform` and `refs/oqminc/ai-resources`.

### 4.2 🔴 BLOCKED (no license) — pattern reference only

- **No file** from these branches may be merged or copied into `main`, even with attribution.
- **Read the source** to understand the *shape* of a solution: event names, schema fields, component anatomy, route structure.
- **Write our own implementation** in our stack: NestJS / Twenty CRM / NATS / LiveKit / Tailwind / Black-Glass.
- **Do not paraphrase code line-by-line** — that is a derivative work. Reimplement against the requirement, not against the source.
- **Currently applies to:** branches 1, 2, 3, 5, 6, 7, 8.

### 4.3 Optional remediation path

If any of the seven BLOCKED branches becomes critical to the build, the cleanest remediation is to open a polite issue or PR on the upstream CelaDaniel repository asking for an MIT (or similar) license to be added. If granted, the branch is reclassified CLEAR and the lift policy upgrades automatically. Until then, treat as pattern-only.

---

## 5. Per-Branch Lift Cards

One card per branch. These are the authoritative reference for any directive that names a `refs/oss/*` branch in its lift-from clause.

### 5.1 Branch #1 — `refs/oss/booking-api`

| Field | Value |
|---|---|
| **Source repo** | `CelaDaniel/Full-Stack-Booking-Management-API` |
| **License** | NONE DETECTED — 🔴 **BLOCKED** |
| **Stack** | TypeScript, Express.js, Prisma, JWT, WebSocket |
| **What it is** | Service-booking API with role-based auth, real-time updates, reviews |
| **Repo structure** | `prisma/` schema (25 files), root Express controllers, Husky git hooks |
| **Lift targets** | Booking entity model (Prisma schema → Twenty CRM custom object); slot-reservation REST shape; WebSocket pattern for live booking-state updates; role-based middleware shape (mapped to our RBAC roles, **not** copied) |
| **CNZ mapping** | Model 1:1 booking flow (CCZ-004); ShowZone / Bijou theatre time-slot reservations (DISC-001); group-private MyGroupZone scheduling (DISC-004); deterministic confirmation checkpoints (T-30 minute logic in Canonical Corpus §5.2) |
| **Discard / replace** | Express → must be reimplemented in NestJS (our standard); JWT auth → must use our Sovereign Kernel auth/2FA stack; review subsystem → out of scope for Phase 1 |
| **Consuming directives** | `CCZ-004`, `DISC-001`, `DISC-004` |
| **Risk note** | NO LICENSE FILE → all-rights-reserved by default. **Pattern lift only** (read for shape, reimplement clean-room). No file ports to `main`. |

### 5.2 Branch #2 — `refs/oss/socketio-chat`

| Field | Value |
|---|---|
| **Source repo** | `CelaDaniel/nodejs-socketio-chat-application` |
| **License** | NONE DETECTED — 🔴 **BLOCKED** |
| **Stack** | Node.js, Socket.io |
| **What it is** | Minimal real-time chat with rooms; demonstrates Socket.io room-join/leave/broadcast |
| **Repo structure** | 3 files at root (`index.js` + 2 supporting). Tutorial-grade. |
| **Lift targets** | Room namespace pattern; join/leave/broadcast event names; basic message schema |
| **CNZ mapping** | Reference only for room-chat transport in OBS surfaces. Our actual transport is **NATS.io** per Sovereign Kernel §11 (Latency Invariant). Use this branch to validate the event-naming convention only. |
| **Discard / replace** | Whole transport layer (Socket.io) is the wrong primitive for us — NATS.io is the canonical fabric. Treat this as illustrative, not portable. |
| **Consuming directives** | `OBS-001`, `OBS-002`, `CCZ-001` |
| **Risk note** | NO LICENSE FILE → pattern reference only. Trivial size (3 files) means low harvest value regardless. |

### 5.3 Branch #3 — `refs/oss/react-chat-app`

| Field | Value |
|---|---|
| **Source repo** | `CelaDaniel/React-Chat-App` |
| **License** | NONE DETECTED — 🔴 **BLOCKED** |
| **Stack** | React (client), Node.js + Socket.io (server) |
| **What it is** | Full-stack 1:1 and group chat with React frontend |
| **Repo structure** | `client/` (53 files: React components, hooks, contexts) + `server/` (14 files: socket handlers, routes) |
| **Lift targets** | React chat-window component anatomy (message list + input + presence indicator); message-bubble layout; typing-indicator UX pattern; client-side message-ordering logic |
| **CNZ mapping** | Model↔guest DM surface (CCZ-001); guest↔guest DM surface (CCZ-002). UX patterns only — visual design must match our Black-Glass / Laser-Focus aesthetic per Sovereign Kernel §1. |
| **Discard / replace** | Server half is duplicative of `socketio-chat` (#2) and same NATS reasoning applies. CSS/styling discarded entirely (wrong aesthetic). |
| **Consuming directives** | `CCZ-001`, `CCZ-002` |
| **Risk note** | NO LICENSE FILE → component-shape reference only, no direct file copy. |

### 5.4 Branch #4 — `refs/oss/discussion-platform` ⭐

| Field | Value |
|---|---|
| **Source repo** | `CelaDaniel/next_discussion_platform` |
| **License** | **MIT** — 🟢 **CLEAR** |
| **Stack** | Next.js, Firebase, Recoil (atoms/), Chakra UI |
| **What it is** | Reddit-style forum: communities, posts, comments, voting, user profiles |
| **Repo structure** | `components/` (44 files: post cards, comment threads, community sidebars) + `pages/` (11 files) + `atoms/` (5: Recoil state) + `hooks/` (7) + `firebase/` (3) + `functions/` (3) + `chakra/` (3) |
| **Lift targets** | **PORTABLE under MIT (with attribution):** post-card component, comment-thread renderer, voting-button pattern, community-sidebar layout. Recoil atoms can inform our state-shape design. |
| **CNZ mapping** | Internal departmental discussion forum (FC-001 → FC-006: feed/community/post/comment/vote/profile); company-wide announcements channel (OPS-004); the "internal app for departments to talk to one another" Kevin recalled. |
| **Discard / replace** | Firebase backend → replace with our PostgreSQL/Twenty CRM stack; Chakra UI → replace with our Tailwind/Black-Glass design system; auth → replace with our SSO. |
| **Consuming directives** | `FC-001`, `FC-002`, `FC-003`, `FC-004`, `FC-005`, `FC-006`, `OPS-004` |
| **Risk note** | ⭐ **ONLY MIT-licensed branch in the harvest.** Direct file ports allowed with LICENSE preservation + NOTICE attribution. **This is the highest-value branch in the set.** |

### 5.5 Branch #5 — `refs/oss/live-polling`

| Field | Value |
|---|---|
| **Source repo** | `CelaDaniel/react-polling` |
| **License** | NONE DETECTED — 🔴 **BLOCKED** |
| **Stack** | Socket.io + React, with separate `dist/` and `views/` output |
| **What it is** | Live audience polling demo (vote → real-time tally broadcast) |
| **Repo structure** | `views/` (13 files: poll templates) + `less/` (5 files: styling) + `dist/` (3 files: built artifacts) + root server |
| **Lift targets** | Vote-aggregation event pattern; tally-broadcast cadence; result-bar render shape |
| **CNZ mapping** | Could inform the HotZone Heat Score live-update cadence (Canonical Corpus §7.1) and live-poll mini-feature for stream rooms. **Tertiary value** — not on critical path. |
| **Discard / replace** | Socket.io → NATS (same as #2/#3); LESS styling discarded; `views/` template engine not part of our Next.js stack. |
| **Consuming directives** | OBS Room-Heat Engine |
| **Risk note** | NO LICENSE FILE → pattern reference only. Low-priority branch; consider deprioritizing or removing in next sweep if not exercised within 90 days. |

### 5.6 Branch #6 — `refs/oss/zoom-clone`

| Field | Value |
|---|---|
| **Source repo** | `CelaDaniel/zoom-clone` |
| **License** | NONE DETECTED — 🔴 **BLOCKED** |
| **Stack** | Next.js 14, Stream (video SDK), Tailwind CSS |
| **What it is** | Enterprise video-conferencing UI: meeting rooms, scheduling, recordings, personal room |
| **Repo structure** | `app/` (12 files: Next.js routes incl. `/meeting`, `/upcoming`, `/previous`, `/personal-room`, `/recordings`) + `components/` (24 files: MeetingRoom, MeetingSetup, MeetingTypeList, controls) + `actions/`, `hooks/`, `lib/`, `providers/` |
| **Lift targets** | Meeting-room layout shape (gallery vs spotlight view); scheduling UI flow (upcoming/previous/recordings tabs); meeting-controls bar; participant tile grid |
| **CNZ mapping** | Bijou theatre room UI (DISC); ShowZone group-private layout; AfterHoursPrivateZone 1:1 setup screen; recordings dashboard for the Recording-to-Merch pipeline (Corpus §7.2) |
| **Discard / replace** | Stream video SDK → we use **self-hosted LiveKit** (per Thread 15 decision); auth → our SSO; landing-page routes → our marketing stack. |
| **Consuming directives** | OBS Theatre UI, DISC series |
| **Risk note** | NO LICENSE FILE → UI/layout reference only. Stream SDK calls **must** be replaced with LiveKit equivalents during any port. |

### 5.7 Branch #7 — `refs/oss/loadbalancer-nginx`

| Field | Value |
|---|---|
| **Source repo** | `CelaDaniel/loadbalancer-nginx-docker-nodejs` |
| **License** | NONE DETECTED — 🔴 **BLOCKED** |
| **Stack** | Nginx, Docker, Node.js |
| **What it is** | Round-robin load balancer in front of multiple Node.js backends |
| **Repo structure** | `nginx/` (2 files: `nginx.conf` + Dockerfile) + `backend/` (5 files: minimal Node service) + 3 root files (docker-compose, README, etc.) |
| **Lift targets** | Nginx `upstream{} + proxy_pass` config pattern; docker-compose service-fan-out shape |
| **CNZ mapping** | Reference for the LiveKit SFU node fleet front-end (Bijou). Our production config will need sticky sessions + WebSocket upgrade headers — **this repo doesn't show those**. |
| **Discard / replace** | Toy-grade config (no TLS, no health checks, no sticky sessions, no rate limiting). Use only as a starting skeleton. |
| **Consuming directives** | Bijou SFU infra |
| **Risk note** | NO LICENSE FILE → config-pattern reference. nginx.conf snippets are typically uncopyrightable but we'll write our own to be safe. |

### 5.8 Branch #8 — `refs/oss/social-media-app`

| Field | Value |
|---|---|
| **Source repo** | `CelaDaniel/Social-media-react-app` |
| **License** | NONE DETECTED — 🔴 **BLOCKED** |
| **Stack** | React, Firebase |
| **What it is** | Minimal social wall: post, like, comment, profile |
| **Repo structure** | `src/` (16 files: components + pages) + `firebase/` (1 file: config) + 8 root files |
| **Lift targets** | Profile-page layout; post-creation form; like/comment interaction shape |
| **CNZ mapping** | Model's own chat-feed / wall (CCZ-003 — the "My PR Zone" surface); follower feed (FC-003) |
| **Discard / replace** | Smaller and shallower than `next_discussion_platform` (#4); largely redundant with it. Firebase backend not used. |
| **Consuming directives** | `FC-003`, `CCZ-003` |
| **Risk note** | NO LICENSE FILE → reference only. **Recommend deprioritizing** in favor of #4 (which is MIT and more complete). |

### 5.9 Branch #9 — `refs/oqminc/ai-resources`

| Field | Value |
|---|---|
| **Source repo** | `mahseema/free-ai-resources` |
| **License** | **MIT** — 🟢 **CLEAR** (curated link list) |
| **Stack** | Markdown documentation (no executable code) |
| **What it is** | Curated index of free AI/ML learning resources, courses, books, papers |
| **Repo structure** | Markdown reference docs only |
| **Lift targets** | Reference material — used as a research bibliography, not a code source. No file porting required or expected. |
| **CNZ mapping** | Background research for OBS-005 (AI-assisted broadcast tooling), HeartZone biometric loop training data, neural-net experiments (NN-001/002), and DFSP (deepfake / synthetic-presence policy) research. |
| **Discard / replace** | Not a code repo. Use as bibliography only. |
| **Consuming directives** | `OBS-005`, `HZ`, `NN-001`, `NN-002`, `DFSP` |
| **Risk note** | MIT, but content is third-party links — verify each cited resource's license before using anything beyond the link itself. |

---

## 6. Checklist for Directive Authors

Whenever a new directive is authored (or an existing one revised) that may consume an OSS branch, the author **must** include a `LIFT-FROM` block. Use this template:

```yaml
## LIFT-FROM
Source branch:    refs/oss/<branch-name>
License status:   <CLEAR | BLOCKED>
Lift mode:        <DIRECT_PORT | PATTERN_REFERENCE>
Files in scope:   <explicit list, or "shape only">
Reimplementation: <NestJS / Twenty CRM / NATS / LiveKit / Tailwind>
Attribution:      <required | not required>
```

If `Lift mode` is `DIRECT_PORT`, the directive **must also** append the attribution line to `PROGRAM_CONTROL/DIRECTIVES/QUEUE/OSS-Attributions.md` as part of its commit.

---

## 7. Maintenance

- This index is reviewed at the open of every odd-numbered thread (or on demand).
- If a branch is exercised by a directive, append a row to **Section 8 (Activity Log)** with: directive ID, date, files actually ported, attribution status.
- If a branch sits unused for **90 days**, flag it in the next thread review. The CI block costs nothing to keep, but unused references add cognitive load.
- If upstream license status changes, update the affected card and the summary table.

---

## 8. Activity Log

*(Empty as of v1.2 — no directive has yet exercised a `refs/oss/*` branch.)*

| Date | Directive | Branch | Files Ported | Attribution |
|---|---|---|---|---|
| — | — | — | *(no entries yet)* | — |

---

## 9. Cross-References

- `PROGRAM_CONTROL/DIRECTIVES/QUEUE/OSS-Repo-Registry.md` — registry status (HARVESTED)
- `PROGRAM_CONTROL/REPORT_BACK/THREAD15-OSS-HARVEST.md` — original harvest report-back
- `PROGRAM_CONTROL/DIRECTIVES/QUEUE/OSS-Attributions.md` — *to be created by the first directive that performs a `DIRECT_PORT`*
- `OQMI Coding Doctrine` — third-party code policy
- `ChatNow.Zone Canonical Corpus v10` — all section references in the per-branch cards
- `Sovereign Kernel` — architectural authority for stack decisions (NestJS, NATS, LiveKit, Black-Glass)

---

## Revision History

| Version | Date | Change |
|---|---|---|
| v1 | 21 Apr 2026 | Initial draft (paths under `REFERENCE_LIBRARY/`) |
| v1.1 | 21 Apr 2026 | CEO directive: relocate reference library under `PROGRAM_CONTROL/DIRECTIVES/REFERENCE_LIBRARY/`. Renamed numeric-prefix files to hyphen convention. |
| v1.2 | 21 Apr 2026 | CEO directive: collapse to flat structure — all reference docs live directly in `PROGRAM_CONTROL/DIRECTIVES/QUEUE/` alongside the lift index. No `REFERENCE_LIBRARY/` subfolder. |

---

*OmniQuest Media Inc. · ChatNow.Zone Build Control · `REF-LIB-OSS-LIFT-01` · v1.2 DRAFT · 21 April 2026*
