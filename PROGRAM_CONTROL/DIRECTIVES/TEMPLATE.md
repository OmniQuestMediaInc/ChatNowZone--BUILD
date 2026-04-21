---
TARGET: <copilot|droid|claude-code>
CORRELATION_ID: <THREAD##-DOMAIN-###>
CEO_GATE: <yes|no>
STATUS: queued
REPORT_BACK_PATH: PROGRAM_CONTROL/REPORT_BACK/<filename>.md
CREATED: <ISO-8601 UTC>
AUTHOR: <name>
---

# DIRECTIVE — <TARGET-AGENT> — <SHORT TITLE>

Authority: Kevin B. Hartley, CEO — OmniQuest Media Inc.
Thread: <NN>
Target: <agent>
Repo: OmniQuestMediaInc/ChatNowZone--BUILD
Report-back path: <REPORT_BACK_PATH from front-matter>
Correlation ID: <CORRELATION_ID from front-matter>

## OPERATING RULES

- Read PROGRAM_CONTROL/OPERATING_RULES.md before starting.
- Read PROGRAM_CONTROL/DIRECTIVES/README.md if this is your first
  directive of the session.
- Zero confirmation questions.
- Never fabricate output. Quote CLI output verbatim.
- FIZ 4-line commit format: subject + REASON + IMPACT + CORRELATION_ID.
- Yarn only for package operations.
- Honor CEO_GATE field. If yes, deliver as PR; do not push to main.

## SCOPE

<one paragraph describing what this directive accomplishes>

## STEPS

1. <step one>
2. <step two>
3. <...>

## REPORT-BACK FORMAT

File at: <REPORT_BACK_PATH>

<structure of the expected report-back, section by section>

## COMMIT MESSAGE

<DOMAIN>: <subject>

REASON: <why this directive exists>

IMPACT: <what changes on main; what runtime behavior shifts>

CORRELATION_ID: <CORRELATION_ID>

## DO-NOT LIST

- <constraint one>
- <constraint two>
- <...>

## AMBIGUITY HANDLING

<how to handle situations the directive does not anticipate>
