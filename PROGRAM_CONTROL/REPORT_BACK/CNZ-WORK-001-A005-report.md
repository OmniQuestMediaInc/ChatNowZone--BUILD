# CNZ-WORK-001-A005 — Archive Sovereign_Kernel.md.pdf

**Status on completion:** DONE
**Agent:** claude-code
**Date:** 2026-04-23
**PR:** (pending — Wave A root cleanup PR)
**Merge commit SHA:** (pending merge)

## What was done

- `Sovereign_Kernel.md.pdf` moved from repo root to `archive/governance/Sovereign_Kernel.md.pdf` via `git mv`.
- Updated inbound reference in `.github/copilot-instructions.md` line 7 from the retired file to the new canonical Source of Truth (`PROGRAM_CONTROL/DIRECTIVES/QUEUE/OQMI_GOVERNANCE.md`) with a note that the PDF is retired and archived.
- Replaced the placeholder bullet in `OQMI_SYSTEM_STATE.md` §8 Provenance Notes with a real provenance entry recording the archive move.

## What was found / surfaced

- The kickoff/standing-prompt docs (`PROGRAM_CONTROL/DIRECTIVES/QUEUE/CNZ-CLAUDE-CODE-KICKOFF.md` line 34; `CNZ-CLAUDE-CODE-STANDING-PROMPT.md` line 34) claim A005 was already done via "PR #248, commit `90bcdab`". This is INCORRECT — no such commit exists in the repository (`git show 90bcdab` returns "unknown revision") and `Sovereign_Kernel.md.pdf` was still present at repo root until this PR. The status tables in those docs should be corrected in a subsequent pass; not done here to keep this PR atomic per OQMI_GOVERNANCE §8.
- `.github/copilot-instructions.md` remains structurally stale relative to `OQMI_GOVERNANCE.md` and the CNZ-WORK-001 charter: it still describes the old Autonomous Directive Protocol (IN_PROGRESS move, REQUIREMENTS_MASTER update, Agent: COPILOT header convention) and enumerates 14 commit prefixes that differ from both the old `OQMI_SYSTEM_STATE.md` v2.0 list and whatever A012 produces. Out of scope for this PR; surfaced here as discovered-debt for CEO to convert into a new task if desired.

## What's left

Nothing for A005. Discovered-debt items above are flagged for separate follow-up.

## Files touched

- `Sovereign_Kernel.md.pdf` → `archive/governance/Sovereign_Kernel.md.pdf` (rename, 100%)
- `.github/copilot-instructions.md` (line 7 only)
- `PROGRAM_CONTROL/DIRECTIVES/QUEUE/OQMI_SYSTEM_STATE.md` (§8 bullet replaced)
- `PROGRAM_CONTROL/DIRECTIVES/QUEUE/CNZ-WORK-001.md` (§6 status amended)
- `PROGRAM_CONTROL/DIRECTIVES/DONE/CNZ-WORK-001-A005-DONE.md` (new)
- `PROGRAM_CONTROL/REPORT_BACK/CNZ-WORK-001-A005-report.md` (this file)

## Tests added / modified

None (file move + doc updates only).

## OQMI_SYSTEM_STATE.md updates landed in same PR

- §3 DONE: yes — A005 row added
- §5 OUTSTANDING: no (not in §5)
- §6 BLOCKERS: no
- §8 Provenance Notes: yes — stale placeholder bullet replaced with real archive provenance
