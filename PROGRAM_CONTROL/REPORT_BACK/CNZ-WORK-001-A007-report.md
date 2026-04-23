# CNZ-WORK-001-A007 — Resolve package-lock.json + yarn.lock co-presence

**Status on completion:** DONE
**Agent:** claude-code
**Date:** 2026-04-23
**PR:** (pending — Wave A root cleanup PR)
**Merge commit SHA:** (pending merge)

## What was done

- Verified `package-lock.json` is **not present** in the repo (`ls package-lock.json` returns no such file).
- Verified no CI workflow under `.github/workflows/` references `package-lock.json` or executes `npm install` / `npm ci`.
- Confirmed `yarn.lock` is the sole lockfile at repo root, aligned with OQMI_GOVERNANCE.md §5.3 (Yarn-only policy).
- No file-edit work required; task is administratively closed.

## What was found / surfaced

- `git log --all -- package-lock.json` returns no history, suggesting the file either never landed on main or was removed before the current history window. Recent yarn.lock sync activity (PRs #290, #291, #292) indicates the yarn-only posture is stable.
- `.github/workflows/copilot-setup-steps.yml` references `yarn` — consistent with the §5.3 policy.
- Other workflows do not invoke a package manager install step directly and are not affected.

## What's left

Nothing. Invariant is already satisfied. Admin closure only.

## Files touched

- `PROGRAM_CONTROL/DIRECTIVES/QUEUE/CNZ-WORK-001.md` (§6 status amended)
- `PROGRAM_CONTROL/DIRECTIVES/QUEUE/OQMI_SYSTEM_STATE.md` (§3 DONE row added)
- `PROGRAM_CONTROL/DIRECTIVES/DONE/CNZ-WORK-001-A007-DONE.md` (new)
- `PROGRAM_CONTROL/REPORT_BACK/CNZ-WORK-001-A007-report.md` (this file)

## Tests added / modified

None.

## OQMI_SYSTEM_STATE.md updates landed in same PR

- §3 DONE: yes — A007 row added
- §5 OUTSTANDING: no
- §6 BLOCKERS: no
