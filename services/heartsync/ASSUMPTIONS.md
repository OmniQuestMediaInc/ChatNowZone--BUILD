# HeartSync — ASSUMPTIONS.md

## A001 — Tier Config Seeded in DB
Assumes `heartsync_tier_configs` rows exist for all seven tiers before
`onModuleInit` is called. If the table is empty, all tiers default to
`disabled`. Operators must seed the table post-migration.

## A002 — Caller Enforces Sampling Interval Jitter
HeartSyncService does not enforce the 1.5–3 s random sampling cadence.
This is delegated to the device gateway or calling service. The service
processes each submitted sample as presented.

## A003 — Single Session Per session_id
Each `session_id` maps to exactly one HeartSync relay session. If the
same `session_id` is reopened without closing, the prior state is
overwritten. Callers must close sessions cleanly.

## A004 — Driver Availability Is Caller-Managed
HeartSyncService resolves the driver by name only; it does not perform
device-level capability negotiation. The integration layer (Lovense API,
Buttplug.io WebSocket, etc.) is managed by downstream consumers of the
`heartsync.haptic.dispatched` NATS event.

## A005 — IP Hash Is Pre-Computed by Caller
The `ip_hash` field in `GrantConsentDto` must be a SHA-256 hex digest
computed by the API gateway or middleware layer. HeartSyncService never
receives or stores raw IP addresses.

## A006 — COMBINED Mode Requires Both BPMs
In COMBINED mode, the combined BPM event is only emitted once samples
from both the creator and the guest have been received in the session.
Until both sides have submitted at least one valid sample, the
`relayCombined` call is a no-op.

## A007 — Process-Restart Clears All Session State
HeartSyncService uses in-process Map for ephemeral state. A process
restart clears all open sessions. Callers must handle reconnection and
re-open sessions after restart.

## A008 — Tier Config Cache Is Not Distributed
`tierEnabled` and `tierCombinedAllowed` Maps are local to each process
instance. In a horizontally-scaled deployment, call
`POST /heartsync/tier-config/refresh` on all instances after a DB change,
or implement a NATS fanout for config invalidation.
