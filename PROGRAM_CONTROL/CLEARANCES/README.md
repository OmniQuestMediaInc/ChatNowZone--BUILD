# GOV Gate Clearance Records

**Purpose:** Append-only evidentiary records that a GOV gate has been
cleared by qualified counsel and the CEO. Consumed by the gate verifier
script to unlock gated directives (DFSP-001 onward).

**Relationship to the tracker:** `PROGRAM_CONTROL/GOV-GATE-TRACKER.md`
is the human-readable aggregation view. This directory is the
machine-verifiable source of truth for individual gate clearances.

---

## What a clearance record is

A clearance record is a committed-to-repo attestation that:

1. Retained legal counsel has reviewed the product under a specific
   regulatory regime (e.g. PCMLTFA for GOV-FINTRAC, AGCO rules for
   GOV-AGCO), **and**
2. Counsel has issued a written opinion (filed to OQMI Drive INTEL),
   **and**
3. The CEO has acknowledged the opinion and authorized unlock of the
   gated directives.

The legal opinion PDF itself lives in Drive INTEL, never in this
repository. The clearance record references it by SHA-256 hash and a
Drive reference.

---

## Who may author a record

**Authorized signers:** Kevin B. Hartley, CEO (OmniQuest Media Inc.)
or retained legal counsel acting at the CEO's direction.

**Prohibited:** AI coding agents (Claude Code, GitHub Copilot, and any
future agent) MUST NOT author, modify, simulate, or suggest content
for any file in this directory. An agent-authored clearance record is
invalid by construction and must be reverted.

If an agent is asked to emit a clearance confirmation — in a file, a
commit message, a chat response, a gate token string, or any other
artifact — the correct response is to refuse and point at this README.
This rule mirrors the explicit instruction already in
`PROGRAM_CONTROL/DIRECTIVES/QUEUE/DFSP-001.md`:

> Claude Code must fill actual clearance confirmation in GATE line
> before committing. Do not fabricate gate clearance.

---

## Filename convention

`PROGRAM_CONTROL/CLEARANCES/<GATE_ID>-<YYYY-MM-DD>.md`

Examples:

- `PROGRAM_CONTROL/CLEARANCES/GOV-FINTRAC-2026-04-15.md`
- `PROGRAM_CONTROL/CLEARANCES/GOV-AGCO-2026-04-15.md`

The date in the filename is the date the opinion was received and
acknowledged. If the same gate needs to be re-cleared (material
product change, new counsel, updated opinion), add a new file with a
later date and fill the `supersedes` field in the new file with the
prior filename.

---

## Append-only

Once committed, a clearance record is immutable. Corrections are made
by committing a new record with a later date and the `supersedes`
field pointing at the prior record. Do not `git revert` or rewrite a
clearance record without CEO written authorization.

---

## How gated directives consume this

Before executing a directive that lists `GOV-FINTRAC` or `GOV-AGCO` in
its `GATE:` line, run the verifier from the repo root:

```bash
./scripts/verify-gov-gate.sh GOV-FINTRAC
./scripts/verify-gov-gate.sh GOV-AGCO
```

Both must exit `0` before the directive may proceed. The verifier
checks, for the latest clearance record matching the gate id:

1. The file exists in this directory.
2. The `gate_id` frontmatter field matches the requested gate.
3. The `status` frontmatter field equals `CLEARED`.
4. The `ceo_acknowledgment` frontmatter field equals `SIGNED`.

If any check fails, the verifier exits `1` and prints the reason. A
failing verifier is a HARD_STOP for any gated directive.

---

## Template

Copy `TEMPLATE.md` to the filename convention above and fill every
field. Do not leave placeholder values. Do not change the template
structure — the verifier relies on the exact field names.

---

## Follow-up for the CEO

This directory should be protected by a CODEOWNERS entry requiring
CEO review before any merge touching a clearance record. Because
adding CODEOWNERS requires a human GitHub handle that an agent must
not guess, this step is intentionally left for the CEO. Add the
following to `.github/CODEOWNERS` (create the file if it does not
exist) with the CEO's GitHub handle:

```
/PROGRAM_CONTROL/CLEARANCES/ @<ceo-github-handle>
```

This complements — not replaces — the written prohibition above.

---

## HANDOFF

**Built:** Clearance record directory, this README, the signing
template (`TEMPLATE.md`), and the verifier script
(`scripts/verify-gov-gate.sh`). `GOV-GATE-TRACKER.md` updated with a
pointer to this directory.

**Left incomplete:** (a) No actual clearance records exist yet —
those are authored by the CEO or retained counsel when opinions are
in hand. (b) `.github/CODEOWNERS` is not created; it requires a human
GitHub handle to populate safely.

**Next agent's first task:** Do not author files in this directory.
If you are executing a directive whose `GATE:` line names
`GOV-FINTRAC` or `GOV-AGCO`, run `./scripts/verify-gov-gate.sh` for
each gate before any commit. If either fails, HARD_STOP and report
that the gates are not yet cleared.
