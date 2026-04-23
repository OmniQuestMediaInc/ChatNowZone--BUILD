# CNZ-WORK-001-A005 — DONE

**Task name:** Archive Sovereign_Kernel.md.pdf
**Wave:** A
**Completed:** 2026-04-23
**Agent:** claude-code
**PR:** (pending — Wave A root cleanup PR)
**Merge commit SHA:** (pending merge)
**REPORT_BACK:** `PROGRAM_CONTROL/REPORT_BACK/CNZ-WORK-001-A005-report.md`

## Summary

`Sovereign_Kernel.md.pdf` moved from repo root to `archive/governance/Sovereign_Kernel.md.pdf` via `git mv`. The sole live inbound reference (`.github/copilot-instructions.md` line 7) was updated to point to the current Source of Truth (`OQMI_GOVERNANCE.md`) with a note recording the retirement. `OQMI_SYSTEM_STATE.md` §8 Provenance Notes was updated to replace the placeholder bullet with real archive provenance.

## Files merged

- `Sovereign_Kernel.md.pdf` → `archive/governance/Sovereign_Kernel.md.pdf` (rename, 100%)
- `.github/copilot-instructions.md`
- `PROGRAM_CONTROL/DIRECTIVES/QUEUE/OQMI_SYSTEM_STATE.md`
- `PROGRAM_CONTROL/DIRECTIVES/QUEUE/CNZ-WORK-001.md`
- `PROGRAM_CONTROL/DIRECTIVES/DONE/CNZ-WORK-001-A005-DONE.md`
- `PROGRAM_CONTROL/REPORT_BACK/CNZ-WORK-001-A005-report.md`

## Follow-ups (if any)

1. `CNZ-CLAUDE-CODE-KICKOFF.md` / `CNZ-CLAUDE-CODE-STANDING-PROMPT.md` incorrectly list A005 as done via PR #248 / commit `90bcdab` (neither exists). Their status tables should be corrected in a separate pass.
2. `.github/copilot-instructions.md` is structurally stale against `OQMI_GOVERNANCE.md` / `CNZ-WORK-001.md` (old Autonomous Directive Protocol, 14-prefix enum, retired doctrine references). A dedicated reconciliation task should be authored.
