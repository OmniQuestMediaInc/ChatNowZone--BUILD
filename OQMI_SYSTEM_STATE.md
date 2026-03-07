# OQMI System State — Source of Truth

## Project
**ChatNow.Zone — BUILD**
Repository: `OmniQuestMedia/ChatNowZone--BUILD`

## Doctrine
- **Append-Only Ledger**: All financial transactions are immutable INSERTs. No UPDATE/DELETE on `ledger_entries`.
- **Deterministic Logic**: All financial calculations are pure, reproducible functions.
- **Work Order Governance**: No code change ships without a referenced, approved WO ID.

## Repository Structure

```
/
├── .github/
│   └── copilot-instructions.md   # Droid Mode governance rules
├── docs/
│   └── doctrine/                 # Governance documents
├── infra/
│   └── postgres/
│       └── init-ledger.sql       # Core financial schema (append-only)
├── services/
│   ├── core-api/                 # Main NestJS application
│   ├── risk-engine/              # Mini Credit Bureau API
│   └── rewards-api/              # RedRoom Rewards White-label
├── docker-compose.yml            # Orchestration: PostgreSQL, Redis, Core-API
├── OQMI_SYSTEM_STATE.md          # This file — canonical source of truth
└── README.md
```

## Core Services

| Service | Path | Role |
|---|---|---|
| core-api | services/core-api | Main NestJS application; orchestrates all business logic |
| risk-engine | services/risk-engine | Mini Credit Bureau API; user risk scoring |
| rewards-api | services/rewards-api | RedRoom Rewards white-label integration |

## Database Schema Summary

| Table | Purpose | Mutation Policy |
|---|---|---|
| `user_risk_profiles` | Mini Credit Bureau scoring per user | INSERT + UPDATE allowed |
| `studio_contracts` | Payroll split logic for studio/performer contracts | INSERT + UPDATE allowed |
| `ledger_entries` | Append-only transaction history | INSERT ONLY — no UPDATE/DELETE |
| `transactions` | Tracks every movement of value between users (tip, subscription, private_show) | INSERT ONLY — no UPDATE/DELETE |

## Infrastructure

| Component | Image | Purpose |
|---|---|---|
| PostgreSQL | postgres:16 | Primary relational data store |
| Redis | redis:7 | Caching and session state |
| core-api | (local build) | NestJS application server |

## Program Control Contacts
- Authority: Kevin (Program Control / OmniQuestMedia)
- Droid Executor: GitHub Copilot (Coding Agent)

## Change Log

| Date | WO ID | Description |
|---|---|---|
| 2026-03-06 | WO-INIT-001 | Initialize repository structure, ledger schema, docker-compose, governance files |
