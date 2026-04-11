---
# CEO-AUTHORIZED-STAGED clearance record — machine-parsed frontmatter.
# Do not rename or remove fields. The verifier script reads these.
# Authorized signer: Kevin B. Hartley, CEO — OmniQuest Media Inc.
# AI coding agents must not fill this file. See README.md.

authorization_type: CEO_AUTHORIZED_STAGED
status: CEO_AUTHORIZED_STAGED        # accepted by verify-gov-gate.sh alongside CLEARED
ceo_acknowledgment: SIGNED
authorized_date: "2026-04-11"
gates_covered: "GOV-FINTRAC GOV-AGCO"  # space-separated; verifier does word-match
blocking_release:
  - DFSP-001
  - DFSP-002
  - PROC-002
  - DFSP-003
  - PROC-003
  - DFSP-004
  - DFSP-005
  - DFSP-006
  - PROC-004
  - PROC-005
  - DFSP-007
  - DFSP-008
correlation_id: "CEO-STAGED-GOV-2026-04-11"
reason_code: "CEO_AUTHORIZED_STAGED_ENGINEERING_GATE_REMOVAL_2026-04-11"
signed_by: "Kevin B. Hartley, CEO — OmniQuest Media Inc."
signed_at: "2026-04-11T00:00:00-04:00"
supersedes: ""
note: >
  Staged authorization to remove GOV-FINTRAC and GOV-AGCO engineering
  gates so that DFSP-001 onward may proceed. Legal counsel review is
  still recommended; a standard per-gate clearance record
  (GOV-FINTRAC-YYYY-MM-DD.md / GOV-AGCO-YYYY-MM-DD.md, status: CLEARED)
  should be issued once written opinions are in hand and will supersede
  this record.
---

# CEO-AUTHORIZED-STAGED — GOV-FINTRAC + GOV-AGCO Gate Removal

**Authorization date:** 2026-04-11
**Authorized by:** Kevin B. Hartley, CEO — OmniQuest Media Inc.
**Authorization type:** CEO_AUTHORIZED_STAGED

---

## 1. Gates covered

- **GOV-FINTRAC** — Do CNZ tokens constitute virtual currency under PCMLTFA?
- **GOV-AGCO** — Are CNZ tokens gambling-adjacent under AGCO rules?

---

## 2. Scope of staged authorization

This record removes the engineering gates for GOV-FINTRAC and GOV-AGCO,
allowing DFSP-001 onward (all V6 directives previously blocked by those
gates) to proceed to execution.

**Directives unblocked:**
DFSP-001, DFSP-002, PROC-002, DFSP-003, PROC-003,
DFSP-004, DFSP-005, DFSP-006, PROC-004, PROC-005,
DFSP-007, DFSP-008

---

## 3. Basis for staged authorization

- CNZ tokens have no cash-out design; tokens cannot be redeemed for cash
  or cash equivalents.
- No secondary market is supported.
- Token balances are non-transferable between users.
- Staged engineering work does not alter the product's cash-out posture.
- Legal counsel review is still recommended and should be initiated.

---

## 4. CEO acknowledgment

By committing this file with `status: CEO_AUTHORIZED_STAGED` and
`ceo_acknowledgment: SIGNED`, the CEO attests that:

- The staged authorization is made on the basis of the product facts
  stated in section 3.
- If any material fact in section 3 changes, this staged authorization
  is invalidated and must be re-issued.
- This authorization unblocks only the directives listed in
  `blocking_release` above, and nothing beyond them.
- A standard full-clearance record (status: CLEARED) must be issued
  once written legal opinions are in hand.

Signed: Kevin B. Hartley, CEO — OmniQuest Media Inc.
Date:   2026-04-11 (America/Toronto)

---

**Reminder:** After this file is committed, tick the corresponding
entries in `PROGRAM_CONTROL/GOV-GATE-TRACKER.md` so the human-readable
view stays in lockstep with the machine-verifiable record.
