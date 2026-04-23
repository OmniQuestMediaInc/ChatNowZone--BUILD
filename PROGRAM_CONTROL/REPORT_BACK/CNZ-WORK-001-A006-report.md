# CNZ-WORK-001-A006 — Delete superseded root-level OQMI_SYSTEM_STATE.md (v2.0 doctrine)

**Status on completion:** DONE
**Agent:** claude-code
**Date:** 2026-04-23
**PR:** (pending — Wave A root cleanup PR)
**Merge commit SHA:** (pending merge)

## What was done

- Deleted root-level `OQMI_SYSTEM_STATE.md` (the retired v2.0 "OQMI CODING DOCTRINE" dated 2026-03-28) via `git rm`.
- Updated `.github/required-files.txt` line 5 from `OQMI_SYSTEM_STATE.md` to `PROGRAM_CONTROL/DIRECTIVES/QUEUE/OQMI_SYSTEM_STATE.md` so the `validate-structure` CI job (ci.yml §"Check required files exist") continues to pass against the live SoT file.
- Updated `.github/copilot-instructions.md` line 8 to reference the `CNZ-WORK-001.md` active charter and the QUEUE-path `OQMI_SYSTEM_STATE.md`, with a note that the root file was deleted as superseded.

## What was found / surfaced

- Root `OQMI_SYSTEM_STATE.md` carried the retired "OQMI CODING DOCTRINE v2.0" including the old Work-Order system retirement notice. Its role is entirely superseded by `OQMI_GOVERNANCE.md` (doctrine) and `PROGRAM_CONTROL/DIRECTIVES/QUEUE/OQMI_SYSTEM_STATE.md` (live state).
- `.github/copilot-instructions.md` remains structurally stale (old Autonomous Directive Protocol, 14-prefix enum). This is surfaced for a separate reconciliation task, same discovered-debt as in A005 report-back.
- Historical report-backs in `PROGRAM_CONTROL/REPORT_BACK/` reference the old doctrine by file name; left intact per append-only history discipline.

## What's left

Nothing for A006.

## Files touched

- `OQMI_SYSTEM_STATE.md` (deleted from repo root)
- `.github/required-files.txt` (line 5 path updated)
- `.github/copilot-instructions.md` (line 8 replaced)
- `PROGRAM_CONTROL/DIRECTIVES/QUEUE/CNZ-WORK-001.md` (§6 status amended)
- `PROGRAM_CONTROL/DIRECTIVES/QUEUE/OQMI_SYSTEM_STATE.md` (§3 DONE row added)
- `PROGRAM_CONTROL/DIRECTIVES/DONE/CNZ-WORK-001-A006-DONE.md` (new)
- `PROGRAM_CONTROL/REPORT_BACK/CNZ-WORK-001-A006-report.md` (this file)

## Tests added / modified

None. The `validate-structure` CI job uses `.github/required-files.txt`; updated in lockstep with the deletion so the job continues green.

## OQMI_SYSTEM_STATE.md updates landed in same PR

- §3 DONE: yes — A006 row added
- §5 OUTSTANDING: no
- §6 BLOCKERS: no
