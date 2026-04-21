# OQMInc OSS Repo Registry
Authority: Kevin B. Hartley, CEO — OmniQuest Media Inc.
Last updated: Thread 15 — 2026-04-19
Repo: OmniQuestMediaInc/ChatNowZone--BUILD
Status: STUB — to be populated during Thread 15

---

## PURPOSE

This file is the authoritative registry of all open-source reference
repositories harvested into read-only `refs/oss/*` branches.

How to read a file from any reference branch:
  git show refs/oss/{branch-name}:{filepath}

Example:
  git show refs/oss/booking-api:prisma/schema.prisma
  git show refs/oss/socketio-chat:app.js

---

## REGISTRY — 9 REFERENCE REPOS

| Branch | Source Repository | Primary Directive Series | Notes |
|--------|------------------|--------------------------|-------|
| refs/oss/booking-api | CelaDaniel/Full-Stack-Booking-Management-API | CCZ-004, DISC-001/004, OPS-006 | |
| refs/oss/socketio-chat | CelaDaniel/nodejs-socketio-chat-application | OBS-001/002, CCZ-001, OPS-003 | |
| refs/oss/react-chat-app | CelaDaniel/React-Chat-App | CCZ-001/002, OBS-001 | |
| refs/oss/discussion-platform | CelaDaniel/next_discussion_platform | FC-001–006, OPS-004 | |
| refs/oss/live-polling | CelaDaniel/react-polling | OBS Room-Heat Engine broadcast | |
| refs/oss/zoom-clone | CelaDaniel/zoom-clone | OBS ShowZone Theatre UI, DISC | |
| refs/oss/loadbalancer-nginx | CelaDaniel/loadbalancer-nginx-docker-nodejs | Bijou SFU infra, OPS deployment | |
| refs/oss/social-media-app | CelaDaniel/Social-media-react-app | FC-003, CCZ-003, OPS-006 notifications | |
| refs/oqminc/ai-resources | CelaDaniel/free-ai-resources-x | OBS-005, HZ, NN-001/002, DFSP | See 04_AI_REFERENCE_INDEX.md |

---

## ACCESS RULES (INVARIANT)

- refs/* branches are PERMANENT and READ-ONLY.
- They NEVER merge to main under any circumstances.
- They are NEVER deleted.
- Their content is NEVER imported into CNZ source files.
- No package.json, tsconfig, or build config may reference refs/* content.
- CI blocks any PR from refs/* to main.
  See: .github/workflows/protect-ref-branches.yml
- Policy authority: .github/refs-branch-policy.md

---

## HOW TO REFERENCE IN DIRECTIVES

Add to directive CONTEXT section:
  REFERENCE: git show refs/oss/{name}:{filepath}

---

## HARVEST STATUS

| Branch | Harvest Status | Thread Harvested | Notes |
|--------|---------------|-----------------|-------|
| refs/oss/booking-api | ✅ Harvested | Prior to Thread 14 | |
| refs/oss/socketio-chat | ✅ Harvested | Prior to Thread 14 | |
| refs/oss/react-chat-app | ✅ Harvested | Prior to Thread 14 | |
| refs/oss/discussion-platform | ✅ Harvested | Prior to Thread 14 | |
| refs/oss/live-polling | ✅ Harvested | Prior to Thread 14 | |
| refs/oss/zoom-clone | ✅ Harvested | Prior to Thread 14 | |
| refs/oss/loadbalancer-nginx | ✅ Harvested | Prior to Thread 14 | |
| refs/oss/social-media-app | ✅ Harvested | Prior to Thread 14 | |
| refs/oqminc/ai-resources | ✅ Harvested | Prior to Thread 14 | |

---

*END OSS REPO REGISTRY*
