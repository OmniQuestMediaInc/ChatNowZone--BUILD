# PROGRAM_CONTROL — ChatNow.Zone Build Relay

**Authority:** Kevin B. Hartley, CEO/CD — OmniQuest Media Inc.
**Canonical Authority:** OQMI Coding Doctrine v2.0 · Canonical Corpus v10

---

## How This Works
Claude Chat (Program Control)
→ composes directive files
→ Kevin pastes to GitHub Copilot
GitHub Copilot (File Admin)
→ writes directive .md files into QUEUE/
→ moves files between QUEUE/ → IN_PROGRESS/ → DONE/
→ no source code changes
Claude Code (Execution)
→ reads directive from QUEUE/
→ executes, commits source changes
→ writes report-back to REPORT_BACK/
→ moves directive to DONE/
Kevin
→ pastes report-backs from Claude Code into Claude Chat
→ Claude Chat processes and issues next directive

---

## Folder Structure
PROGRAM_CONTROL/
├── DIRECTIVES/
│   ├── QUEUE/          ← next directives to execute (in gate order)
│   ├── IN_PROGRESS/    ← directive currently being executed
│   └── DONE/           ← completed directives
├── REPORT_BACK/        ← execution reports from Claude Code
└── README.md           ← this file

---

## Claude Code Kickoff (standard)
Read PROGRAM_CONTROL/DIRECTIVES/QUEUE/
