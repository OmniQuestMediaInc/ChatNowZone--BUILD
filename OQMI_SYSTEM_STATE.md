# ChatNow.Zone System State & OQMI Doctrine Tracker
**Status:** Infrastructure Initialized [WO-INIT-001 COMPLETE]
**Last Audit:** 2026-03-06
**Doctrine:** OQMI Coding Doctrine (Append-Only, Deterministic, Idempotent)

## 1. Active Epic: [CNZ-CORE-002] Financial Logic & Risk Engine
- [X] Repository Structure Setup
- [X] Dockerization (Network Isolated)
- [X] Secure PostgreSQL Schema (NOT NULL Enforced)
- [ ] Trusted Region Signal (VPN/Proxy Detection)
- [ ] Studio-Aware Ledger Service

## 2. Invariant Rules for Coding Agents
- **NO REFACTORING:** Do not change existing logic unless explicitly instructed.
- **APPEND-ONLY FINANCE:** No UPDATE calls on balance columns. Offsets only.
- **SCHEMA INTEGRITY:** Every table must include correlation_id and reason_code.
- **DROID MODE:** Execute the provided payload exactly as written.
- **NETWORK ISOLATION:** No internal ports (5432, 6379) mapped to public interfaces.

## 3. Production Scope Rules
- **NETWORK ISOLATION:**
  - Postgres (5432) and Redis (6379) must never be bound to a public host interface.
  - All database and cache services are assigned to the `backend` bridge network exclusively.
  - Only the application API layer (port 3000) may expose a host port.
  - Any violation constitutes an `INFRA_SECURITY_VIOLATION`.

## 4. Current Versioning
- **Core API:** v0.0.1
- **Ledger Schema:** v1.1 (BIGINT Cents/NOT NULL)
- **RedRoom API Contract:** [PENDING]