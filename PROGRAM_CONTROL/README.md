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

## Google Drive — BUILDD CONTROL - CNZ

All CNZ control documents also live in:
  Folder: BUILDD CONTROL - CNZ
  ID: 1zB0MZjj92wovoBuhi0TkelZ_t0oNSCHO <!-- BUILDD CONTROL - CNZ (updated 2026-04-18, Thread 14) -->
  URL: https://drive.google.com/drive/folders/1zB0MZjj92wovoBuhi0TkelZ_t0oNSCHO

## Directive Delivery Rules

Directives for Claude Code MUST be Google Docs in Drive (not plain text).
Plain text files return 403. Always use Zapier with convert=true.

Directives for Copilot: paste directly in Copilot chat.
Directives for Claude Code: file to Drive as Google Doc first.

## Reference Library

Canonical reference documents live in REFERENCE_LIBRARY/ on main.
Read via: git show main:REFERENCE_LIBRARY/{filename}
Bootstrap: REFERENCE_LIBRARY/00_THREAD_BOOTSTRAP.md

---

## Claude Code Kickoff (standard)
Read PROGRAM_CONTROL/DIRECTIVES/QUEUE/
