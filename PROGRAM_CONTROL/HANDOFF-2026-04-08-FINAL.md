# CHATNOW.ZONE — PROGRAM CONTROL HANDOFF
**Date:** 2026-04-08 (session close)
**From:** Claude Chat — Thread 1 (context limit)
**To:** Next Claude Chat session
**Authority:** Kevin B. Hartley, CEO/CD — OmniQuest Media Inc.
**Canonical Authority:** OQMI Coding Doctrine v2.0 · Canonical Corpus v10

---

## STATUS: L0 SHIP-GATE CLOSED

All L0 requirements satisfied. Platform cleared for v5 compliance
hardening and processor onboarding (v6).

| Requirement | Directive | Status |
|---|---|---|
| Viewer Age Assurance | GOV-004 | ✅ |
| Performer KYC + 18+ gate | KYC-001 | ✅ |
| Consent & NCII workflow | PRISMA-002 | ✅ |
| RBAC + step-up enforced | AUTH-001 + AUTH-002 | ✅ |
| Moderation + incident lifecycle | MOD-001 | ✅ |
| Audit chain + WORM export | AUDIT-001 + GOV-002 | ✅ |
| Legal hold mechanism | AUDIT-002 | ✅ |
| Processor webhook validation | FIZ-003 | ✅ |
| Wallet & token integrity | INFRA-004 | ✅ |
| Reconciliation confirmed | INFRA-004 | ✅ |

---

## RELAY ARCHITECTURE (established this thread)

- **Claude Chat** — Program Control brain. Composes directives,
  processes report-backs, manages queue, issues next instructions.
- **GitHub Copilot** — File admin. Writes directives to QUEUE/,
  moves QUEUE → IN_PROGRESS → DONE, updates HANDOFF at session end.
  Zero source code changes.
- **Claude Code** — Execution. Reads directive from repo filesystem
  natively, executes, commits, files report-back, self-manages
  QUEUE → DONE move.
- **Google Drive** — Retired from execution layer. INTEL folder
  remains active for OQMI reports only.

## PROGRAM_CONTROL/ STRUCTURE (repo-native)
PROGRAM_CONTROL/
├── DIRECTIVES/
│   ├── QUEUE/          ← next directives (currently empty — v5 not yet queued)
│   ├── IN_PROGRESS/    ← currently empty
│   └── DONE/           ← HOTFIX-AUTH-001, KYC-001, MOD-001,
│                          AUDIT-001, AUDIT-002, INFRA-004
├── REPORT_BACK/        ← all execution reports filed
├── BACKLOGS/
│   ├── CLAUDE_CODE_BACKLOG_v4.md  ← Tier 6 complete
│   ├── CLAUDE_CODE_BACKLOG_v5.md  ← Tier 7 — compliance hardening
│   ├── CLAUDE_CODE_BACKLOG_v6.md  ← Tier 8 — payment processor + Diamond
│   └── CLAUDE_CODE_BACKLOG_v7.md  ← Tier 9 — creator + guest product
└── README.md

---

## NEXT SESSION PRIORITIES

### Immediate — v5 dispatch
First directive queue for next Claude Code session:
1. CHORE-TS — clean 13 pre-existing TS errors (unblocks everything)
2. LEGAL-HOLD-DB — migrate LegalHoldService to DB-backed store
3. GEO-001 — GeoFencingService (after CHORE-TS)
4. AV-001 — AgeVerificationService (after GEO-001, requires GOV-AV legal sign-off)
5. PV-001 — PurchaseVerificationService (awaiting Kevin brief)

Governance directives (non-Claude Code, legal review path):
GOV-FINTRAC · GOV-AGCO · GOV-QUEBEC-25 · GOV-PIPEDA · GOV-CRTC-C11 · GOV-S230

### After v5 — v6 processor integration
PROC-001 → PROC-002 · PROC-003 → PROC-004 → PROC-005
Gate: GOV-FINTRAC + GOV-AGCO legal opinions required before any v6
directive goes to Claude Code.

### After v6 — v7 product experience
SHOWZONE-002 · GPT-001 → DASH-001 → CS-001 → NOTIFY-001

### Concurrent with v7
- Backend testing (load + edge case)
- Dashboard data shape confirmation
- Card requirements spec
- Light Figma exploration (committed spec waits for first test cycle close)

---

## OUTSTANDING ITEMS

1. **INFRA-004 branch** — confirm merged to main before v5 starts
2. **PROGRAM_CONTROL_WEBHOOK** — GitHub secret not yet configured.
   Location: GitHub → Settings → Secrets → Actions → PROGRAM_CONTROL_WEBHOOK
   Purpose: activates HOUSE-002 notify.yml (Slack notification on report-back)
3. **PV-001** — awaiting Kevin brief on full purchase verification requirements
4. **AV-001** — awaiting GOV-AV legal sign-off before Claude Code execution
5. **QUEUE is empty** — next Claude Chat session should dispatch v5 directives
   to Copilot before firing Claude Code

---

## STANDING INVARIANTS (all 15 — unchanged)

1. No UPDATE or DELETE on ledger, audit, game, call session, voucher tables.
2. All FIZ commits require four-line format.
3. No hardcoded constants — always read from governance.config.ts.
4. crypto.randomInt() only. Math.random() prohibited.
5. No @angular/core imports anywhere.
6. npx tsc --noEmit zero code-level errors before commit.
7. Every service has a Logger instance.
8. Report-back mandatory before directive marked DONE.
9. NATS topics only from topics.registry.ts — no string literals.
10. AI services are advisory only — no financial or enforcement execution.
11. Step-up authentication required before any sensitive action execution.
12. RBAC check required before step-up — fail-closed on unknown permission.
13. SHA-256 for all hash operations.
14. All timestamps in America/Toronto.
15. rule_applied_id on every service output object.

---

## APPMODULE IMPORT ORDER (LOCKED)

```typescript
imports: [
  NatsModule,        // 1
  PrismaModule,      // 2
  CreatorModule,     // 3
  SafetyModule,      // 4
  GrowthModule,      // 5
  AnalyticsModule,   // 6
  ComplianceModule,  // 7
  GamesModule,       // 8
  ZoneGptModule,     // 9
  BijouModule,       // 10
  ShowZoneModule,    // 11
  AuthModule,        // 12
]
```

---

*L0 gate closed. Platform cleared. Next: v5 compliance hardening.*
*All changes require human authorization from Kevin B. Hartley / Program Control.*
