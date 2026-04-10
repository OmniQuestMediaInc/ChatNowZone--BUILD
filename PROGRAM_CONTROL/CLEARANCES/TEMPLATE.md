---
# GOV Gate Clearance Record — machine-parsed frontmatter.
# Do not rename or remove fields. The verifier script reads these.
# Authorized signers: Kevin B. Hartley, CEO or retained legal counsel.
# AI coding agents must not fill this file. See README.md.

gate_id: GOV-FINTRAC              # one of: GOV-FINTRAC | GOV-AGCO
status: NOT_CLEARED               # set to CLEARED only when fully signed
ceo_acknowledgment: NOT_SIGNED    # set to SIGNED by the CEO in person
opinion_received_on: YYYY-MM-DD
counsel_firm: ""
counsel_name: ""
counsel_bar_id: ""
counsel_jurisdiction: ""
opinion_document_sha256: ""       # SHA-256 of the opinion PDF in Drive INTEL
drive_intel_reference: ""         # folder/file path in OQMI Drive INTEL
correlation_id: ""                # UUID
reason_code: ""                   # e.g. FINTRAC_MSB_CLASSIFICATION_CLEARED
blocking_release: []              # directive IDs this record unblocks
signed_by: ""                     # "Kevin B. Hartley, CEO — OmniQuest Media Inc."
signed_at: ""                     # ISO-8601 timestamp, America/Toronto
supersedes: ""                    # prior clearance filename, if any
---

# GOV-<REGIME> Clearance Record

> **Signing authority:** Kevin B. Hartley, CEO — OmniQuest Media Inc.,
> or retained legal counsel acting at the CEO's direction.
>
> **Agent prohibition:** This file must be authored by a human. AI
> coding agents must not fill, draft, or suggest values for this
> template. See `README.md` in this directory.

## 1. Regulatory question

State the exact regulatory question counsel was asked to answer.

- For **GOV-FINTRAC**: _Do ChatNow.Zone tokens constitute virtual
  currency under PCMLTFA?_
- For **GOV-AGCO**: _Are ChatNow.Zone tokens gambling-adjacent under
  AGCO rules?_

## 2. Counsel's answer (plain language)

One paragraph. Plain language. The operative conclusion only — not a
summary of the reasoning. The full reasoning lives in the opinion PDF
in Drive INTEL.

## 3. Opinion reference

- **Counsel firm:**
- **Counsel lead name & bar ID:**
- **Opinion dated:**
- **Drive INTEL location:**
- **SHA-256 of opinion PDF:**

Compute the SHA-256 over the final signed PDF and paste the hex
digest into `opinion_document_sha256` in the frontmatter above. This
binds the clearance record to the exact document counsel signed.

## 4. Scope of clearance

- **Gates cleared by this record:**
- **Directives unblocked by this record:**

List the gate IDs and directive IDs unambiguously. These must match
the `gate_id` and `blocking_release` frontmatter fields.

## 5. Material facts presented to counsel

List the specific product facts counsel was asked to rely on. If any
of these change after this record is committed, the clearance is
invalidated and a new record must be issued.

Examples (replace with the actual facts presented):

- Tokens cannot be redeemed for cash or cash equivalents.
- No secondary market is supported.
- Token balances are non-transferable between users.

## 6. CEO acknowledgment

By committing this file with `ceo_acknowledgment: SIGNED`, the CEO
attests that:

- The opinion has been read in full.
- The material facts in section 5 accurately describe the product as
  currently designed and built.
- If any material fact in section 5 changes, this clearance is
  invalidated and must be re-issued.
- This clearance authorizes the directives listed in
  `blocking_release` to proceed, and nothing beyond them.

Signed: _(CEO name — filled by the CEO)_
Date:   _(America/Toronto timestamp — filled by the CEO)_

---

**Reminder:** After this file is committed with
`status: CLEARED` and `ceo_acknowledgment: SIGNED`, also tick the
corresponding checkboxes in `PROGRAM_CONTROL/GOV-GATE-TRACKER.md` so
the human-readable view stays in lockstep with the
machine-verifiable record.
