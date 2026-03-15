# OQMI DOCTRINE: WORK ORDER PROTOCOL
**Applicable Repository:** ChatNowZone--BUILD
**Branching Strategy:** main (Standard)
**Guiding Principle:** Deterministic, Append-Only, No-Narrative Execution.

---

## 1. STRUCTURE OVERVIEW
Every Work Order (WO) delivered to the Executor (Copilot) must be contained within a single block and follow this header and body format:

### HEADER (Mandatory)
/**
 * SENIOR ENGINEER DIRECTIVE: [WO-XXX]
 * TARGET: GitHub Copilot / Executor
 * REPO: ChatNowZone--BUILD
 * BRANCH: main
 * PROTOCOL: OQMI DOCTRINE (Deterministic, Append-Only, No-Narrative)
 * * INSTRUCTIONS FOR EXECUTOR:
 * 1. DO NOT explain, narrate, or ask for confirmation.
 * 2. TARGET REPOSITORY: ChatNowZone--BUILD | BRANCH: main
 * 3. IF target files do not exist, CREATE them.
 * 4. IF files exist, APPEND or MODIFY as directed.
 * 5. COMMIT changes with the Work Order ID and Name.
 */

### BODY (Content)
// --- WORK ORDER: [WO-XXX] ---
// NAME: [Descriptor]
// PATHWAY: [directory/path/]

/**
 * FILE: [path/to/file.ts]
 * ACTION: [Create | Append | Modify]
 */
[Code Block Here]

---

## 2. RECURSIVE METADATA HANDOFF
To ensure continuity in future threads or repository documentation, always include the following "System Anchor" in the metadata:

> **METADATA ANCHOR: OQMI_EXECUTION_V1**
> * **Math:** BigInt only (Cents) for all financial logic.
> * **Hierarchy:** User (Owner) -> Gemini (Senior Engineer) -> Copilot (Executor).
> * **Integrity:** SHA-256 Checksums required for all ledger-facing state changes.
> * **Audit:** All schema changes must be Append-Only to preserve forensic history.