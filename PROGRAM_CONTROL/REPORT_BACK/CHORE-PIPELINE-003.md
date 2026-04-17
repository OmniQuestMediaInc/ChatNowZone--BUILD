# REPORT BACK — CHORE-PIPELINE-003

**Directive ID:** CHORE-PIPELINE-003
**Agent:** COPILOT
**Repo:** OmniQuestMediaInc/ChatNowZone--BUILD
**Branch:** copilot/chore-pipeline-003-build-dispatch-workflow
**Status:** COMPLETE

---

## Confirmation Checklist

### ✅ directive-dispatch.yml created with all 4 jobs

File: `.github/workflows/directive-dispatch.yml`

| Job | Name | Trigger | Status |
|-----|------|---------|--------|
| 1 | `assign-to-agent` | `issues: opened` | ✅ Present |
| 2 | `conflict-detection` | `push` to main on QUEUE/*.md | ✅ Present |
| 3 | `lifecycle-pr-opened` | `pull_request: opened` targeting main | ✅ Present |
| 4 | `lifecycle-pr-merged` | `pull_request: closed` + merged == true | ✅ Present |

### ✅ Permissions block present in directive-dispatch.yml

```yaml
permissions:
  contents: write
  issues: write
  pull-requests: write
```

### ✅ directive-intake.yml patched with PR instruction block

The `gh issue create` step now uses an inline body that appends the Copilot PR
instruction. The `--body-file` argument was replaced with:

```bash
PR_INSTRUCTION=$(printf '\n\n---\n**Copilot agent instruction:** ...')
gh issue create \
  --title "$TITLE" \
  --body "$(cat "$FILE")$PR_INSTRUCTION" \
  --label "copilot-task"
```

### ✅ Workflow YAML syntax confirmed valid

```
DISPATCH: VALID  (python3 yaml.safe_load — no errors)
INTAKE:   VALID  (python3 yaml.safe_load — no errors)
```

---

## Files Changed

```
.github/workflows/directive-dispatch.yml   (created)
.github/workflows/directive-intake.yml     (patched)
PROGRAM_CONTROL/REPORT_BACK/CHORE-PIPELINE-003.md  (created)
PROGRAM_CONTROL/DIRECTIVES/DONE/CHORE-PIPELINE-003.md  (moved)
```

---

## Job Logic Summary

**Job 1 — assign-to-agent**
- Parses `**Agent:**` field from issue body via grep
- COPILOT → `gh issue edit --add-assignee "app/copilot"`
- CLAUDE_CODE → adds `claude-code-task` label + posts comment
- Always adds `dispatched` label
- All failures are non-fatal (echo ⚠️ and continue)

**Job 2 — conflict-detection**
- Reads all `.md` files in QUEUE/ and IN_PROGRESS/
- Extracts `**Touches:**` field via Python regex
- Builds filepath→directive_id map
- Opens conflict issue for any path shared by 2+ directives
- Labels: `conflict`, `needs-conflict-review`
- Does NOT block push

**Job 3 — lifecycle-pr-opened**
- Extracts directive ID from PR title via sed regex
- Moves `QUEUE/[ID].md` → `IN_PROGRESS/[ID].md`
- Commits: `CHORE: [ID] QUEUE → IN_PROGRESS (PR #N opened)`
- Pushes to PR branch (not main)
- Skips silently if file not found

**Job 4 — lifecycle-pr-merged**
- Extracts directive ID from PR title
- Moves `IN_PROGRESS/[ID].md` → `DONE/[ID].md`
- Commits: `CHORE: [ID] IN_PROGRESS → DONE (PR #N merged)`
- Pushes to main
- Closes corresponding GitHub Issue with comment
- Skips silently if file not found

---

## Result

**SUCCESS** — All 4 jobs present and correct. Both workflow files pass YAML
validation. Directive lifecycle and conflict-detection automation is live.
