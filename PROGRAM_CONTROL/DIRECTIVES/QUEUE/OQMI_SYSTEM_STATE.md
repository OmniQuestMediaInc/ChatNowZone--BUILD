# OQMI SYSTEM STATE

**Document:** OQMI_SYSTEM_STATE.md
**Repo:** [REPO NAME — fill in per repo]
**Version:** v1.0
**Last Updated:** [YYYY-MM-DD — update on every meaningful change]
**Owner:** Kevin B. Hartley, CEO — OmniQuest Media Inc.
**Governing Document:** `OQMI_GOVERNANCE.md` (this repo, root)

---

## 0. PURPOSE

This document is the living tech-debt and accomplishment tracker for this repository. It answers, at any point in time, three questions:

1. **DONE** — What has been built and is in production or merged to `main`?
2. **WIP** — What is actively in progress, on which branch, by which agent?
3. **OUTSTANDING** — What remains to be built, in what priority order, with what blockers?

It is NOT a doctrine document. Doctrine lives in `OQMI_GOVERNANCE.md` (generic, repo-portable) and, where applicable, in this repo's product Canonical Corpus.

This document is rescoped from prior versions which carried doctrine inline. Doctrine has been moved to `OQMI_GOVERNANCE.md`. This file now tracks state only.

This document is repo-specific in content and repo-portable in shape. Drop the structure into any OmniQuest Media Inc. repo and populate.

---

## 1. REPO ORIENTATION

| Field | Value |
|---|---|
| Repo name | [e.g., ChatNowZone--BUILD] |
| Repo URL | [GitHub URL] |
| Default branch | `main` |
| Package manager | [Yarn / npm / pnpm — must match `README.md`] |
| Primary languages | [e.g., TypeScript 84%, PLpgSQL 16%] |
| Active build epic | [e.g., CNZ-CORE-002, or "none — maintenance"] |
| Hard launch deadline | [Date or "n/a"] |
| Visibility | [public / private] |

---

## 2. SERVICE INVENTORY

List every service, app, or top-level module in the repo with its current state. Update on add/remove/rename.

| Service / Module | Path | Status | Owner Agent | Notes |
|---|---|---|---|---|
| [e.g., three-bucket-wallet] | `services/wallet/` | DONE | claude-code | Idempotent, ledger-tested |
| [e.g., risk-engine] | `services/risk/` | WIP | copilot | Branch: `feature/vamp-hardening` |
| [e.g., heartzone-iot-loop] | `services/heartzone/` | OUTSTANDING | unassigned | Blocked on hardware spec |

Status values: `DONE`, `WIP`, `OUTSTANDING`, `STUB`, `RETIRED`, `BLOCKED`

---

## 3. DONE — Shipped to `main`

Reverse-chronological list of completed work. Each entry one row. Pruning policy: items older than 90 days may be archived to `OQMI_SYSTEM_STATE_ARCHIVE.md` to keep this file scannable.

| Date | Item | PR / Commit | Agent | Notes |
|---|---|---|---|---|
| 2026-04-23 | CNZ-WORK-001-A005 — Sovereign_Kernel.md.pdf archived to `archive/governance/` | (Wave A cleanup PR) | claude-code | Updated inbound ref in `.github/copilot-instructions.md`; DONE record `CNZ-WORK-001-A005-DONE.md` |
| 2026-04-23 | CNZ-WORK-001-A006 — root `OQMI_SYSTEM_STATE.md` (v2.0 doctrine) deleted as superseded | (Wave A cleanup PR) | claude-code | Updated `.github/required-files.txt` and `.github/copilot-instructions.md` to live SoT path; DONE record `CNZ-WORK-001-A006-DONE.md` |
| 2026-04-23 | CNZ-WORK-001-A007 — package-lock.json / yarn.lock co-presence confirmed resolved | (Wave A cleanup PR) | claude-code | Admin closure; `package-lock.json` absent, no CI workflow references it; DONE record `CNZ-WORK-001-A007-DONE.md` |
| 2026-04-23 | CNZ-WORK-001-A011 — `PROGRAM_CONTROL/DIRECTIVES/DONE/` and `PROGRAM_CONTROL/REPORT_BACK/` presence confirmed | (Wave A cleanup PR) | claude-code | Admin closure; both paths exist and are populated; DONE record `CNZ-WORK-001-A011-DONE.md` |
| 2026-04-22 | CNZ-WORK-001-A001 — Q-000-PRE-READ-AUDIT (foundational repo audit) | direct-land `<FILL-IN A001 SHA>` | claude-code | Agent-hint "copilot" overridden per charter §2; DONE record `CNZ-WORK-001-A001-DONE.md` |
| 2026-04-22 | CNZ-WORK-001-A004 — Ghost Alpha provenance landed in §8 | direct-land `<FILL-IN A004 SHA>` | claude-code | Prerequisite for A003 (root README.md deletion); DONE record `CNZ-WORK-001-A004-DONE.md` |
| 2026-04-21 | CNZ-WORK-001-A002 — CLAUDE.md archived to `archive/governance/` | #293 `6cf5764` | claude-code | Admin closure filed 2026-04-23; DONE record `CNZ-WORK-001-A002-DONE.md` |

---

## 4. WIP — In Progress

Active work. Update when started, when blocked, and when completed (move to §3). One row per branch.

| Branch | Item | Started | Agent | Blocker | Next Action |
|---|---|---|---|---|---|

If a WIP item has been static for >7 days without a blocker, that itself is a flag — surface in §6.

---

## 5. OUTSTANDING — Backlog

Prioritized list of work not yet started. Top of the list is the next thing to work on. CEO sets priority order; agents do not reorder without instruction.

| Priority | Item | Source | Estimated Scope | Blocker | Notes |
|---|---|---|---|---|---|
| 1 | [Highest priority outstanding work] | [e.g., Deficit doc row R-12] | [S/M/L/XL] | [none / what's needed first] | |
| 2 | [Next item] | [Source] | | | |
| 3 | [...] | | | | |

Source values:
- `Deficit doc row [ID]` — derived from technical deficit document
- `Canonical Corpus §[N]` — derived from product Canonical Corpus requirement
- `Business plan §[N]` — derived from business plan technical requirement
- `Bug` — defect found in shipped code
- `CEO directive YYYY-MM-DD` — direct CEO instruction
- `Tech debt` — internal cleanup not driven by external requirement

Scope values: `S` (<1 day), `M` (1–3 days), `L` (3–10 days), `XL` (>10 days, should be decomposed)

---

## 6. BLOCKERS & FLAGS

Active blockers, stalled work, and items requiring CEO attention. Each entry should resolve to either a CEO decision, an external action, or a re-assignment.

| Date Flagged | Item | Type | Owner | What's Needed |
|---|---|---|---|---|
| YYYY-MM-DD | [e.g., HeartZone scope unclear vs HeartPleasureExperiences] | CEO clarification | claude-in-chat | Naming and scope decision |
| YYYY-MM-DD | [e.g., Vendor X integration broken] | External dependency | copilot | Vendor support response |

Type values: `CEO clarification`, `External dependency`, `Tooling`, `Credential`, `Architecture decision`, `Other`

---

## 7. RETIRED ITEMS

Things that were in this repo, have been removed, and should not be reintroduced. Recorded so future agents do not accidentally rebuild retired work.

| Date Retired | Item | Reason |
|---|---|---|
| YYYY-MM-DD | [e.g., Work Order (WO-XXXX) protocol] | Friction without auditability gain; replaced by scoped commit discipline |
| YYYY-MM-DD | [e.g., KIMI peer agent integration] | Agent retired from workflow |

---

## 8. PROVENANCE NOTES

Anything an incoming agent needs to know that doesn't fit elsewhere: terminology that has shifted, files that look authoritative but aren't, branches that look active but are dead, peculiarities of this repo's history.

- `/tests/seed_data/` is the authoritative source for Ghost Alpha simulations. (Preserved from root `README.md` prior to A003 deletion; landed by CNZ-WORK-001-A004 on 2026-04-22.)
- `Sovereign_Kernel.md.pdf` is RETIRED and has been archived to `archive/governance/Sovereign_Kernel.md.pdf` (CNZ-WORK-001-A005, 2026-04-23). Do not treat as authoritative.
- [e.g., Branch `copilot/chore-old-branch` is 1 commit ahead of main but stale; review before deletion.]
- [e.g., This repo's commit prefixes are declared in `README.md` — consult before committing.]

---

## 9. THIS DOCUMENT'S OWN STATE

| Field | Value |
|---|---|
| Last full review | YYYY-MM-DD |
| Reviewed by | [agent or CEO] |
| Stale-flag threshold | 30 days since last update triggers automatic flag |

If this document has not been updated in 30 days but the repo has commits in that window, the document is out of date and the next agent to touch the repo should reconcile it before doing other work.

---

## 10. UPDATE PROTOCOL

Any agent that completes, starts, blocks, retires, or reprioritizes work in this repo MUST update this document in the same PR as the work itself. Updating this file is not Human-Review Category — it auto-merges with the work it documents.

Format discipline:

- Add new rows; do not delete historical ones except via §3 archive policy or §7 retirement
- Use ISO dates (YYYY-MM-DD)
- Use the status enums declared in §2 and source enums declared in §5
- One item per row; if an item has multiple sub-items, decompose into multiple rows or link out to an issue tracker

Failure to update this document on relevant PRs is a §4.4 violation under `OQMI_GOVERNANCE.md`.

---

## 11. END OF DOCUMENT

This document tracks the state of [REPO NAME]. It does not declare doctrine. For doctrine, see `OQMI_GOVERNANCE.md` (this repo, root). For product-specific operational and compliance doctrine where applicable, see this repo's program charter (e.g., `PROGRAM_CONTROL/DIRECTIVES/QUEUE/RRR-GOV-002` for ChatNowZone--BUILD).

**Authority:** Kevin B. Hartley, CEO — OmniQuest Media Inc.
