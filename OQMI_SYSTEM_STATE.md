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
1. NO REFACTORING: Do not change existing logic unless explicitly instructed.
2. APPEND-ONLY FINANCE: No UPDATE calls on balance columns. Offsets only.
3. SCHEMA INTEGRITY: Every table must include correlation_id and reason_code.
4. DROID MODE: Execute the provided payload exactly as written.
5. NETWORK ISOLATION: No internal ports (5432, 6379) mapped to public interfaces.

## 3. Current Versioning
- Core API: v0.0.1
- Ledger Schema: v1.1 (BIGINT Cents/NOT NULL)
- RedRoom API Contract: [PENDING]