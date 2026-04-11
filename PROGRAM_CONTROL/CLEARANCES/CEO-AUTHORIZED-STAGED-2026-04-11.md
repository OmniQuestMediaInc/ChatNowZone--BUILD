---
# CEO-AUTHORIZED-STAGED record — machine-parsed frontmatter.
# This record authorizes DFSP-001 onward to proceed while legal opinions
# for GOV-FINTRAC and GOV-AGCO are actively being obtained.
# Authorized signers: Kevin B. Hartley, CEO — OmniQuest Media Inc.

authorization_type: CEO_AUTHORIZED_STAGED
authorization_date: 2026-04-11
authorized_by: "Kevin B. Hartley, CEO — OmniQuest Media Inc."
gates_covered: "GOV-FINTRAC GOV-AGCO"
status: CEO_AUTHORIZED_STAGED
ceo_acknowledgment: SIGNED
directives_unblocked: "DFSP-001 DFSP-002 PROC-002 DFSP-003 PROC-003 DFSP-004 DFSP-005 DFSP-006 PROC-004 PROC-005 DFSP-007 DFSP-008"
correlation_id: ceo-auth-staged-2026-04-11
reason_code: CEO_STAGED_GATE_REMOVAL_2026_04_11
signed_by: "Kevin B. Hartley, CEO — OmniQuest Media Inc."
signed_at: "2026-04-11T00:00:00-04:00"
---

# CEO-AUTHORIZED-STAGED — GOV-FINTRAC + GOV-AGCO Engineering Gates

**Authorization type:** CEO-AUTHORIZED-STAGED
**Authorization date:** 2026-04-11
**Authorized by:** Kevin B. Hartley, CEO — OmniQuest Media Inc.

---

## 1. Gates covered

- **GOV-FINTRAC** — Do CNZ tokens constitute virtual currency under PCMLTFA?
- **GOV-AGCO** — Are CNZ tokens gambling-adjacent under AGCO rules?

---

## 2. Directives unblocked

DFSP-001, DFSP-002, PROC-002, DFSP-003, PROC-003, DFSP-004, DFSP-005,
DFSP-006, PROC-004, PROC-005, DFSP-007, DFSP-008

---

## 3. Basis for staged authorization

The CEO authorizes DFSP-001 onward to proceed under the following
conditions:

- CNZ tokens have no cash-out design — tokens cannot be redeemed for
  cash or cash equivalents.
- No secondary market is supported.
- Token balances are non-transferable between users.
- Legal counsel retention for written opinions on GOV-FINTRAC and
  GOV-AGCO is actively in progress.
- This staged authorization does not substitute for retained legal
  opinion. Opinions must be obtained and clearance records filed
  in accordance with `PROGRAM_CONTROL/CLEARANCES/README.md` once
  counsel delivers the written opinion.

---

## 4. Conditions and limitations

- If any material fact in section 3 changes before legal opinions are
  received, this staged authorization is immediately invalidated and
  engineering must halt pending a new authorization.
- This authorization does not permit changes to balance columns,
  cash-out mechanics, secondary markets, or inter-user token transfer.
- All directives unblocked herein remain subject to all other
  applicable engineering invariants (FIZ four-line commit format,
  append-only finance, NATS event routing, multi-tenant mandate, etc.).
- Legal opinions, once received, must be committed as standard
  clearance records per `TEMPLATE.md` and this staged authorization
  superseded by the corresponding `GOV-FINTRAC-YYYY-MM-DD.md` and
  `GOV-AGCO-YYYY-MM-DD.md` records.

---

## 5. CEO acknowledgment

By committing this file with `status: CEO_AUTHORIZED_STAGED` and
`ceo_acknowledgment: SIGNED`, the CEO attests that:

- The material facts in section 3 accurately describe the product as
  currently designed and built.
- Legal counsel retention is actively in progress for both GOV-FINTRAC
  and GOV-AGCO.
- This staged authorization will be superseded by standard per-gate
  clearance records once opinions are received.
- The directives listed in section 2 are authorized to proceed under
  the conditions in section 4.

Signed: Kevin B. Hartley, CEO — OmniQuest Media Inc.
Date:   2026-04-11T00:00:00-04:00 (America/Toronto)
