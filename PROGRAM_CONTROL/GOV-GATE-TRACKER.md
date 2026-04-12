# GOV Gate Tracker
Last updated: 2026-04-11
Authority: Kevin B. Hartley, CEO — OmniQuest Media Inc.

---

## GOV-FINTRAC
**Gates:** DFSP-001 onward (all V6 directives except PROC-001)
**Question:** Do CNZ tokens constitute virtual currency under PCMLTFA?
**Primary defence:** No cash-out design — tokens cannot be redeemed
for cash or cash equivalents.
**Risk signal:** 50 recent MSB revocations indicate active enforcement.
**Status:** ✅ CEO-AUTHORIZED-STAGED — engineering gate removed 2026-04-11
**Engineering gate:** REMOVED — see `PROGRAM_CONTROL/CLEARANCES/CEO-AUTHORIZED-STAGED-2026-04-11.md`
**Counsel retained:** [ ] Not yet / [ ] Yes — retained on: ___________
**Opinion received:** [ ] Not yet / [ ] Yes — received on: ___________
**Filed to Drive INTEL:** [ ] Not yet / [ ] Yes
**Note:** Legal opinion still recommended; staged authorization allows
engineering to proceed. When counsel opinion is received, replace with
a standard `GOV-FINTRAC-YYYY-MM-DD.md` clearance record (status: CLEARED).
**Blocking:** ~~DFSP-001, DFSP-002, PROC-002, DFSP-003, PROC-003,~~
             ~~DFSP-004, DFSP-005, DFSP-006, PROC-004, PROC-005,~~
             ~~DFSP-007, DFSP-008~~ — unblocked by CEO-AUTHORIZED-STAGED-2026-04-11

---

## GOV-AGCO
**Gates:** DFSP-001 onward (same as GOV-FINTRAC)
**Question:** Are CNZ tokens gambling-adjacent under AGCO rules?
**Primary defence:** Documentation that tokens have no cash-out value
and cannot be redeemed for cash or cash equivalents.
**Status:** ✅ CEO-AUTHORIZED-STAGED — engineering gate removed 2026-04-11
**Engineering gate:** REMOVED — see `PROGRAM_CONTROL/CLEARANCES/CEO-AUTHORIZED-STAGED-2026-04-11.md`
**Documentation prepared:** [ ] Not yet / [ ] Yes — prepared on: ______
**Counsel reviewed:** [ ] Not yet / [ ] Yes — reviewed on: ____________
**Filed to Drive INTEL:** [ ] Not yet / [ ] Yes
**Note:** Same staged authorization as GOV-FINTRAC. When counsel review
is complete, replace with `GOV-AGCO-YYYY-MM-DD.md` (status: CLEARED).
**Blocking:** ~~Same as GOV-FINTRAC above~~ — unblocked by CEO-AUTHORIZED-STAGED-2026-04-11

---

## GOV-AV
**Gates:** AV-001 only — independent, does not gate V6 or any
          DFSP/PROC directive
**Question:** Age verification retention vs. disposal requirements
across jurisdictions (provincial, federal, global)
**Status:** ⏳ Regulatory landscape unsettled — branch-and-hold active
**Regulatory watch:**
  - COPPA biometric restriction: effective April 22, 2026
  - IPC Ontario: hash + outcome only, raw image destruction required
  - 18 U.S.C. § 2257: retain hash + outcome record
  - Provincial variation: unresolved
  - US state variation (up to 50): unresolved
  - Global: unresolved
**AV-001 status:** BRANCH-AND-HOLD — no merge to main until clear
**Vendor shortlist decision:** [ ] Not yet / [ ] Yes
**Counsel retained:** [ ] Not yet / [ ] Yes — retained on: ___________
**Opinion received:** [ ] Not yet / [ ] Yes — received on: ___________
**Filed to Drive INTEL:** [ ] Not yet / [ ] Yes
**Blocking:** AV-001 only

---

## CEO-AUTHORIZED-STAGED EXCEPTIONS
| Directive | Authorization date | Scope |
|---|---|---|
| PROC-001 | 2026-04-10 | Webhook infrastructure only — no ledger writes, no balance columns, no transaction execution |
| DFSP-001 onward | 2026-04-11 | All GOV-FINTRAC + GOV-AGCO gated directives — staged engineering authorization; legal opinion still recommended |

---

## Evidentiary records (machine-verifiable)

Per-gate clearance artifacts live in `PROGRAM_CONTROL/CLEARANCES/`.
Each file carries YAML frontmatter that the gate verifier script reads.

**Standard clearance** (`GOV-FINTRAC-YYYY-MM-DD.md`, `GOV-AGCO-YYYY-MM-DD.md`):
fields `gate_id`, `status: CLEARED`, `ceo_acknowledgment: SIGNED`.

**Staged authorization** (`CEO-AUTHORIZED-STAGED-YYYY-MM-DD.md`):
fields `status: CEO_AUTHORIZED_STAGED`, `ceo_acknowledgment: SIGNED`,
`gates_covered` listing gates covered by this authorization.
Current: `PROGRAM_CONTROL/CLEARANCES/CEO-AUTHORIZED-STAGED-2026-04-11.md`

Machine check (run from repo root before any gated directive):
```bash
./scripts/verify-gov-gate.sh GOV-FINTRAC
./scripts/verify-gov-gate.sh GOV-AGCO
```

Both now exit `0` via the staged authorization record. The verifier
accepts `CLEARED` (standard full clearance) **or** `CEO_AUTHORIZED_STAGED`
(staged CEO authorization) as valid exit-0 statuses. The signing
contract, filename convention, and explicit prohibition against
agent-authored clearance records are documented in
`PROGRAM_CONTROL/CLEARANCES/README.md`.

The checkboxes above remain the human-readable aggregation view —
update them in lockstep with the clearance artifact so the tracker
and the per-gate records do not drift.

---

## Notes
- Gate progress updates: Kevin or counsel commits directly to this file
- Per-gate evidentiary records: `PROGRAM_CONTROL/CLEARANCES/` — signed
  by CEO or retained counsel only, never by an AI agent
- Drive INTEL folder: OQMI INTEL GDrive (legal opinions filed there,
  not in repo)
- Next agent reading this file: check checkbox status above before
  assuming any gate is still open
