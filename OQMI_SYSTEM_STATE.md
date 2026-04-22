# OQMI CODING DOCTRINE v2.0

**Product:** ChatNow.Zone
**Status:** Active
**Last Updated:** March 28, 2026
**Supersedes:** OQMI_DOCTRINE_WORK_ORDER_PROTOCOL.md (WO system retired)

-----

## 1. CORE PRINCIPLES

**Append-Only. Deterministic. Idempotent.**

These three properties are non-negotiable and apply to all code, in all services, at all times.

-----

## 2. WHAT CHANGED FROM v1.0

Work orders (WO-XXXX) are **retired** as a general requirement.

**Rationale:** Work orders created friction for additive, low-risk work (new services, scripts, UI, config) without meaningfully improving auditability. That audit function is now handled by scoped commit discipline (see Section 4) and retained only where financial integrity demands it.

-----

## 3. FINANCIAL INTEGRITY ZONE (FIZ)

The following paths remain under **strict change control** and require an inline `REASON:` block in the commit message before any change is merged:

- `finance/` — all files
- `services/core-api/ledger*` — any ledger-touching logic
- `governance/` — compliance middleware, age-gating, warrant logic
- Any schema migration touching `balance`, `tokens`, `payout`, or `escrow` columns

**FIZ Commit Format:**

```
FIZ: <short description>
REASON: <why this change is necessary>
IMPACT: <what balances/flows are affected>
CORRELATION_ID: <uuid>
```

All other changes use standard commit messages.

-----

## 4. COMMIT DISCIPLINE (REPLACES WORK ORDERS)

Every commit must be:

- **Atomic** — one logical change per commit
- **Descriptive** — commit message states what changed and why in plain language
- **Prefixed** by service scope:

|Prefix  |Scope                                |
|--------|-------------------------------------|
|`FIZ:`  |Financial Integrity Zone (see above) |
|`NATS:` |Messaging fabric changes             |
|`OBS:`  |Broadcast kernel / stream logic      |
|`HZ:`   |HeartZone / biometric loop           |
|`BIJOU:`|Theatre architecture / WebRTC        |
|`CRM:`  |Twenty CRM object / schema changes   |
|`INFRA:`|Docker, network, environment config  |
|`UI:`   |Frontend / Black-Glass interface     |
|`GOV:`  |Compliance / Sovereign CaC middleware|
|`CHORE:`|Tooling, linting, formatting         |

-----

## 5. INVARIANT RULES (UNCHANGED FROM v1.0)

These rules apply to all coding agents at all times:

- **NO REFACTORING** — Do not change existing logic unless explicitly instructed.
- **APPEND-ONLY FINANCE** — No `UPDATE` calls on balance columns. Offsets only.
- **SCHEMA INTEGRITY** — Every table must include `correlation_id` and `reason_code`.
- **NETWORK ISOLATION** — Postgres (5432) and Redis (6379) are never bound to a public interface. Any violation is an `INFRA_SECURITY_VIOLATION`.
- **SECRET MANAGEMENT** — Credentials stored in model’s device browser (LocalStorage/IndexedDB) only. Never on CNZ servers.
- **LATENCY INVARIANT** — All chat and haptic events via NATS.io. No REST polling substitutions.
- **DROID MODE** — Execute provided payloads exactly as written. No creative deviation.

-----

## 6. SECURITY & COMPLIANCE CONSTANTS

|Rule            |Value                                                          |
|----------------|---------------------------------------------------------------|
|3DS2            |Mandatory on all top-ups                                       |
|VAMP Threshold  |Stay below 0.75% dispute rate                                  |
|Dwell Settlement|Must post to ledger within 120s of session close               |
|Warrant Response|Bill C-22: 10-day review cycle via `ProductionOrder` object    |
|Age Gating      |Bill S-210: “Reliable” estimation via Sovereign CaC middleware |
|AI Disclosure   |Bill 149 (ON): AI use disclosed in all creator/fan interactions|
|Four Eyes       |Required on all high-value content approval workflows          |

-----

## 7. AGENT HANDOFF PROTOCOL

When work is handed between agents (Claude, KIMI, etc.):

1. The handing agent leaves a `## HANDOFF` block at the bottom of the relevant file or in a `HANDOFF.md` in the affected service folder.
1. The block must state: what was built, what was intentionally left incomplete, and what the next agent’s first task is.
1. No agent modifies another agent’s completed work without an explicit instruction from a human operator.

-----

## 8. BUILD PRIORITY ORDER

Per CNZ-CORE-002 (active epic):

1. **Three-Bucket Wallet** — builds on existing ledger schema (FIZ-scoped)
1. **Risk Engine** — VAMP hardening, 3DS2, dispute logic
1. **NATS Fabric** — backbone for all subsequent services
1. **OBS Broadcast Kernel** — multi-stream relay, One-Button Private
1. **HeartZone IoT Loop** — Web Bluetooth, GATT 0x180D, haptic webhooks
1. **Bijou.Zone Theatre** — LiveKit/Mediasoup SFU, Dwell-Credit algorithm
1. **Sovereign CaC** — jurisdictional middleware, age gating, warrant automation
1. **UI / Black-Glass Interface** — laser-focus aesthetic, biometric pulsing

-----

*This doctrine is the source of truth for all ChatNow.Zone engineering decisions. Any conflict between this document and a verbal or inline instruction defaults to this document unless a human operator explicitly overrides it in writing.*
