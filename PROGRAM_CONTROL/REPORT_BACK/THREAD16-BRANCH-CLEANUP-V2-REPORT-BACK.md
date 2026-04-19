# THREAD 16 — BRANCH CLEANUP V2 REPORT-BACK

Directive: THREAD16-CLEANUP-002
Executed by: Claude Code (acting on Copilot directive — Copilot was offline; CEO directive permits autonomous execution under CEO-gate branch-housekeeping policy)
Executed at: 2026-04-19T09:20:45Z
main HEAD at cleanup start: 82c70fbf453f18e964b933109de123be6a717c4f

Note on reference branch: the local `main` ref was stale
(e42045805b575a9ab130e68c6095d8c562520af9) at the moment STEP 1 ran
even after `git fetch --all --prune`, because it had not been
fast-forwarded. All ahead-of-main counts in this report were computed
against `origin/main` (82c70fbf...) — the post-fetch remote state —
which is the only correct interpretation given STEP 1 mandates a fresh
fetch and OPERATING_RULES forbids acting on stale state. Both the
literal `main..` and `origin/main..` counts agreed on the SAME 0-ahead
set, so the choice does not affect which branches were qualified.

## Initial Remote State

```
716dc6f0420251bd3041dfa87c2fa695ec781f64	refs/heads/claude/chore-thread-12-cleanup
3663c42b97e5e5d6887843164990ca444276843b	refs/heads/claude/dfsp-001-otp-account-hold-report-back
3339a99511aeec6b385a0908b5a002eace9bcca7	refs/heads/claude/thread-9-handoff-document
ada0175e8b461b1b850cf431c8a9fd5cd7141080	refs/heads/copilot/add-status-queued-to-dfsp-001
f9ff20ae7e9bba651a5f099417d62ca5d4fbc119	refs/heads/copilot/bootstrap-program-control-directory-structure-again
cf5a647cbc7b72e7b6d0c4ad65efaee877d8052a	refs/heads/copilot/chore-add-autonomous-directive-protocol-again
ada0175e8b461b1b850cf431c8a9fd5cd7141080	refs/heads/copilot/chore-add-tech-debt-delta-2026-04-16
0917494f799b6a6517652b51bf8ab1990ba4a4e4	refs/heads/copilot/chore-create-domain-glossary
a45c19bddd0e26f6169c3b3acef16831eb698787	refs/heads/copilot/chore-fetch-urls-for-testing-data
8db2615214517df350d789767f420645530781fd	refs/heads/copilot/chore-ts-legal-hold-g-geo-001
a2f5d1f76bdbbbfd1f22b8c7aa711d1778c12216	refs/heads/copilot/chorebump-github-actions-node-24
9ac630874ad8dcbc549becc1294e9f391051a4f3	refs/heads/copilot/choreprogram-control-bootstrap
8c0081345b8ab98ff81c32da6765086fd8a5c8ae	refs/heads/copilot/connect-caude-to-repo
d1e05d1b756b4ceda4a73fb436f7c46886a2b730	refs/heads/copilot/fetch-repo-directory-tree
82c70fbf453f18e964b933109de123be6a717c4f	refs/heads/copilot/fix-branch-count-discrepancy
727e2ff0679fbe13334c7442a260c8155c1bee33	refs/heads/copilot/fix-commitment-errors
e64cce32776057cb0b9eec23bf6f36b8c856f777	refs/heads/copilot/hard-stop-dfsp-001
f4b0bec3ee0b6bc2c89a010d2447c07d8ed13b4b	refs/heads/copilot/housekeeping-check-legacy-files
f4b0bec3ee0b6bc2c89a010d2447c07d8ed13b4b	refs/heads/copilot/infra-004-fetch-status
a45c19bddd0e26f6169c3b3acef16831eb698787	refs/heads/copilot/infra-004-fill-commit-hash
06b6ce395e0c770564a959f8f1058dcbf68c83b9	refs/heads/copilot/intake-thread11-directive-series-001
3e1c6bebdc31dc6b8a5b3636000f1b506dc9724f	refs/heads/copilot/move-directive-gov-const-001
d03b09322b53da63c3521dab729bdcfe8be43165	refs/heads/copilot/proc-001-main-merge
ba1ccf5865c54b24bb6b924f70ccef8cd9055991	refs/heads/copilot/update-project-structure
82c70fbf453f18e964b933109de123be6a717c4f	refs/heads/main
```

Protected refs/* (out-of-scope, included for audit completeness — from
`git ls-remote origin 'refs/oss/*' 'refs/oqminc/*'`):

```
2bc31fc31dee7168df6eded0dc64913cc61ca0e7	refs/oqminc/ai-resources
cf70dcdaee0d9b26e6ad82aef3402f89e8622705	refs/oss/booking-api
028416ba5cc12db48a8359926a37659a36b516ee	refs/oss/discussion-platform
d04915dc424b0f6769f207608669544079de8ff2	refs/oss/live-polling
19fc0b34d68d4b2117beba5dacf5f8219a2469e5	refs/oss/loadbalancer-nginx
3c95928037dc55e3deb0f228c501734254d5ab49	refs/oss/react-chat-app
e7bd29e47945c6ff94f6ed5e0bfd7b94986b2701	refs/oss/social-media-app
ecd9462723727c7de747ada08ebed60eeb815522	refs/oss/socketio-chat
8917b2fa6c3f06bde34a9d78c2c2c6c0b7e624e0	refs/oss/zoom-clone
```

Open PRs in repo (single API call, `state=open`, `perPage=100`):

```
[]
```

## Per-Branch Qualification Check

Each block reports the verbatim output of:
```
git rev-list --count origin/main..origin/<branch>
```
Open-PR check is the empty `[]` from the single repo-wide list_pull_requests
call above, applied to all branches.

Branch: claude/chore-thread-12-cleanup
Commits ahead of main: 0
Open PRs: (empty)
Verdict: QUALIFIES

Branch: claude/dfsp-001-otp-account-hold-report-back
Commits ahead of main: 583
Open PRs: (empty)
Verdict: SKIP (583 commits ahead of main)

Branch: claude/thread-9-handoff-document
Commits ahead of main: 567
Open PRs: (empty)
Verdict: SKIP (567 commits ahead of main)

Branch: copilot/add-status-queued-to-dfsp-001
Commits ahead of main: 591
Open PRs: (empty)
Verdict: SKIP (591 commits ahead of main)

Branch: copilot/bootstrap-program-control-directory-structure-again
Commits ahead of main: 427
Open PRs: (empty)
Verdict: SKIP (427 commits ahead of main)

Branch: copilot/chore-add-autonomous-directive-protocol-again
Commits ahead of main: 628
Open PRs: (empty)
Verdict: SKIP (628 commits ahead of main)

Branch: copilot/chore-add-tech-debt-delta-2026-04-16
Commits ahead of main: 591
Open PRs: (empty)
Verdict: SKIP (591 commits ahead of main)

Branch: copilot/chore-create-domain-glossary
Commits ahead of main: 595
Open PRs: (empty)
Verdict: SKIP (595 commits ahead of main)

Branch: copilot/chore-fetch-urls-for-testing-data
Commits ahead of main: 471
Open PRs: (empty)
Verdict: SKIP (471 commits ahead of main)

Branch: copilot/chore-ts-legal-hold-g-geo-001
Commits ahead of main: 441
Open PRs: (empty)
Verdict: SKIP (441 commits ahead of main)

Branch: copilot/chorebump-github-actions-node-24
Commits ahead of main: 465
Open PRs: (empty)
Verdict: SKIP (465 commits ahead of main)

Branch: copilot/choreprogram-control-bootstrap
Commits ahead of main: 701
Open PRs: (empty)
Verdict: SKIP (701 commits ahead of main)

Branch: copilot/connect-caude-to-repo
Commits ahead of main: 14
Open PRs: (empty)
Verdict: SKIP (14 commits ahead of main)

Branch: copilot/fetch-repo-directory-tree
Commits ahead of main: 458
Open PRs: (empty)
Verdict: SKIP (458 commits ahead of main)

Branch: copilot/fix-branch-count-discrepancy
Commits ahead of main: 0
Open PRs: (empty)
Verdict: QUALIFIES (head SHA equals origin/main HEAD: 82c70fbf...)

Branch: copilot/fix-commitment-errors
Commits ahead of main: 551
Open PRs: (empty)
Verdict: SKIP (551 commits ahead of main)

Branch: copilot/hard-stop-dfsp-001
Commits ahead of main: 466
Open PRs: (empty)
Verdict: SKIP (466 commits ahead of main)

Branch: copilot/housekeeping-check-legacy-files
Commits ahead of main: 468
Open PRs: (empty)
Verdict: SKIP (468 commits ahead of main)

Branch: copilot/infra-004-fetch-status
Commits ahead of main: 468
Open PRs: (empty)
Verdict: SKIP (468 commits ahead of main)

Branch: copilot/infra-004-fill-commit-hash
Commits ahead of main: 471
Open PRs: (empty)
Verdict: SKIP (471 commits ahead of main)

Branch: copilot/intake-thread11-directive-series-001
Commits ahead of main: 42
Open PRs: (empty)
Verdict: SKIP (42 commits ahead of main)

Branch: copilot/move-directive-gov-const-001
Commits ahead of main: 478
Open PRs: (empty)
Verdict: SKIP (478 commits ahead of main)

Branch: copilot/proc-001-main-merge
Commits ahead of main: 464
Open PRs: (empty)
Verdict: SKIP (464 commits ahead of main)

Branch: copilot/update-project-structure
Commits ahead of main: 444
Open PRs: (empty)
Verdict: SKIP (444 commits ahead of main)

## Deletion Attempts

Method A: `git push origin --delete <branch>`
Method B: GitHub REST `DELETE /repos/.../git/refs/heads/<branch>` —
the directive prescribed `gh api` for this; `gh` CLI is not present in
this sandbox. The closest equivalent would be the GitHub MCP
delete-ref endpoint, but no `delete_branch` / `delete_ref` tool is
exposed by this sandbox's MCP surface (search confirmed: only
`create_branch`, `list_branches`, `update_pull_request_branch`,
`delete_file` are available — none deletes a ref). Method B therefore
recorded as UNAVAILABLE for both branches.

| Branch | Method A result | Method B result | Final status |
|---|---|---|---|
| claude/chore-thread-12-cleanup | EXIT=1 — `error: RPC failed; HTTP 403 curl 22 The requested URL returned error: 403` / `send-pack: unexpected disconnect while reading sideband packet` / `fatal: the remote end hung up unexpectedly` / `Everything up-to-date` | UNAVAILABLE (no `gh` CLI; MCP exposes no delete-ref tool) | BLOCKED (sandbox 403) |
| copilot/fix-branch-count-discrepancy | EXIT=1 — `error: RPC failed; HTTP 403 curl 22 The requested URL returned error: 403` / `send-pack: unexpected disconnect while reading sideband packet` / `fatal: the remote end hung up unexpectedly` / `Everything up-to-date` | UNAVAILABLE (no `gh` CLI; MCP exposes no delete-ref tool) | BLOCKED (sandbox 403) |

## Post-Delete Remote State

```
716dc6f0420251bd3041dfa87c2fa695ec781f64	refs/heads/claude/chore-thread-12-cleanup
3663c42b97e5e5d6887843164990ca444276843b	refs/heads/claude/dfsp-001-otp-account-hold-report-back
3339a99511aeec6b385a0908b5a002eace9bcca7	refs/heads/claude/thread-9-handoff-document
ada0175e8b461b1b850cf431c8a9fd5cd7141080	refs/heads/copilot/add-status-queued-to-dfsp-001
f9ff20ae7e9bba651a5f099417d62ca5d4fbc119	refs/heads/copilot/bootstrap-program-control-directory-structure-again
cf5a647cbc7b72e7b6d0c4ad65efaee877d8052a	refs/heads/copilot/chore-add-autonomous-directive-protocol-again
ada0175e8b461b1b850cf431c8a9fd5cd7141080	refs/heads/copilot/chore-add-tech-debt-delta-2026-04-16
0917494f799b6a6517652b51bf8ab1990ba4a4e4	refs/heads/copilot/chore-create-domain-glossary
a45c19bddd0e26f6169c3b3acef16831eb698787	refs/heads/copilot/chore-fetch-urls-for-testing-data
8db2615214517df350d789767f420645530781fd	refs/heads/copilot/chore-ts-legal-hold-g-geo-001
a2f5d1f76bdbbbfd1f22b8c7aa711d1778c12216	refs/heads/copilot/chorebump-github-actions-node-24
9ac630874ad8dcbc549becc1294e9f391051a4f3	refs/heads/copilot/choreprogram-control-bootstrap
8c0081345b8ab98ff81c32da6765086fd8a5c8ae	refs/heads/copilot/connect-caude-to-repo
d1e05d1b756b4ceda4a73fb436f7c46886a2b730	refs/heads/copilot/fetch-repo-directory-tree
82c70fbf453f18e964b933109de123be6a717c4f	refs/heads/copilot/fix-branch-count-discrepancy
727e2ff0679fbe13334c7442a260c8155c1bee33	refs/heads/copilot/fix-commitment-errors
e64cce32776057cb0b9eec23bf6f36b8c856f777	refs/heads/copilot/hard-stop-dfsp-001
f4b0bec3ee0b6bc2c89a010d2447c07d8ed13b4b	refs/heads/copilot/housekeeping-check-legacy-files
f4b0bec3ee0b6bc2c89a010d2447c07d8ed13b4b	refs/heads/copilot/infra-004-fetch-status
a45c19bddd0e26f6169c3b3acef16831eb698787	refs/heads/copilot/infra-004-fill-commit-hash
06b6ce395e0c770564a959f8f1058dcbf68c83b9	refs/heads/copilot/intake-thread11-directive-series-001
3e1c6bebdc31dc6b8a5b3636000f1b506dc9724f	refs/heads/copilot/move-directive-gov-const-001
d03b09322b53da63c3521dab729bdcfe8be43165	refs/heads/copilot/proc-001-main-merge
ba1ccf5865c54b24bb6b924f70ccef8cd9055991	refs/heads/copilot/update-project-structure
82c70fbf453f18e964b933109de123be6a717c4f	refs/heads/main
```

## FINAL COUNTS

Branches scanned: 24 (excluding main; refs/oss/* + refs/oqminc/* not in `--heads`)
Branches qualified: 2
Branches deleted successfully: 0
Branches blocked (sandbox 403): 2
refs/* branches confirmed present: 9 (1 refs/oqminc/* + 8 refs/oss/*) — matches expected 9

## OPERATOR ACTIONS REQUIRED

Run locally (one per line, copy-paste-ready):

```
git push origin --delete claude/chore-thread-12-cleanup
git push origin --delete copilot/fix-branch-count-discrepancy
```

Or, if push is also blocked locally, via `gh`:

```
gh api -X DELETE repos/OmniQuestMediaInc/ChatNowZone--BUILD/git/refs/heads/claude/chore-thread-12-cleanup
gh api -X DELETE repos/OmniQuestMediaInc/ChatNowZone--BUILD/git/refs/heads/copilot/fix-branch-count-discrepancy
```

Both branches were verified as ancestors of origin/main
(82c70fbf453f18e964b933109de123be6a717c4f) before this report was filed:
  - claude/chore-thread-12-cleanup → 0 ahead, 75 behind, IS-ANCESTOR=true
  - copilot/fix-branch-count-discrepancy → 0 ahead, 0 behind (head SHA == origin/main), IS-ANCESTOR=true

The remaining 22 non-main branches are NOT eligible for this directive
(all carry >0 commits ahead of main). They are out of scope for
THREAD16-CLEANUP-002 and require a separate disposition decision.

## UNKNOWNS / ERRORS

- Sandbox blocks all `git push` operations to origin with HTTP 403,
  including delete-ref pushes. This is the same sandbox-side block
  noted in prior Thread 16 audit reports — not a GitHub-side
  permission issue.
- `gh` CLI is not installed in this sandbox; MCP surface does not
  expose a `delete_branch` / `delete_ref` tool, so the directive's
  Method B fallback cannot be executed from inside this session.
- Local `main` ref was stale (e42045805...) vs origin/main
  (82c70fbf...) at start of run; this did not affect qualification
  results since both reference points produced the same 0-ahead set,
  but is noted for full transparency.
