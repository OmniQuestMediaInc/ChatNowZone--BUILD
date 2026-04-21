THREAD 16 — OPERATING RULES (HARD-BAKED, CARRY INTO ALL FUTURE HANDOFFS)

1. CEO-GATE POLICY
   - Financial / policy / governance changes: land via PR, CEO reviews + merges.
   - Everything else: agents land on main autonomously. No CEO hand.
   - Financial = money, credits, tokens, balances, ledgers, wallets, escrow, payouts, pricing, fees, discounts, multipliers, tier economics, gifting, rewards, governance.config.ts, finance/**, ledger/audit/wallet/pay/tok/memb/gwp/fiz schema tables.
   - Policy = safety/**, governance/**, *POLICY*, *DECISIONS*, legal/compliance/KYC/age-verification.
   - Governance = decision-making authority, branch protection, CI enforcement, CEO-gate definitions, canonical locks (01_CANONICAL_LOCKS.md), membership tier enum, token lifecycle.

2. CHAT OUTPUT FORMAT (Claude in chat)
   - All directives in ONE code block, top to bottom, no prose breaks inside.
   - Zero framing outside the code block unless asked.
   - Minimal explanation. No "why I did it this way" sections unless requested.
   - Paste-ready: user copies block once, pastes into agent, done.

3. DIRECTIVE FORMAT (Claude → Copilot / Droid / Claude Code)
   - Authority line, target agent, repo, thread number.
   - Report-back path: PROGRAM_CONTROL/REPORT_BACK/<THREAD##>-<NAME>-REPORT-BACK.md
   - FIZ 4-line commit: subject + REASON + IMPACT + CORRELATION_ID.
   - Yarn only for package ops.
   - Zero confirmation questions.
   - Never fabricate output.
   - Do-not list at end.

4. HANDOFF AUTHORING (end of every thread)
   - Must include this block verbatim as its OPERATING RULES section.
   - Must not drift from chat format or CEO-gate rules.
   - Future Claude reads this block first before anything else.

## 5. AUTONOMOUS DIRECTIVE WORKFLOW

Effective Thread 16: all agent task assignments flow through
PROGRAM_CONTROL/DIRECTIVES/ rather than chat-pasted instructions.

- Directive files live in PROGRAM_CONTROL/DIRECTIVES/QUEUE/.
- Agents auto-pickup matching directives per the protocol in
  PROGRAM_CONTROL/DIRECTIVES/README.md.
- CEO-gated directives require CEO action (status flip) before
  agent pickup.
- Report-backs continue to land in PROGRAM_CONTROL/REPORT_BACK/.
- Handoffs at thread close must reference any directives still in
  QUEUE/, IN_PROGRESS/, or BLOCKED/ as carry-forward items.

This workflow is the governance-layer mechanism that operationalizes
the CEO-gate policy across all autonomous agent activity.
