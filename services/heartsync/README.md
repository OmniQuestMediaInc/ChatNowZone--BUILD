# HeartSync — Biometric Relay Service

**Service prefix:** `HZ:`  
**Domain:** HeartZone / biometrics  
**Path:** `services/heartsync/`

## Purpose

HeartSync is the real-time biometric relay layer for ChatNow.Zone. It
receives raw BPM samples from connected haptic devices, validates them,
and relays them between consenting creators and guests to enable
synchronised haptic feedback.

## Supported Membership Tiers

| Tier | Default Enabled | Combined Mode |
|------|----------------|--------------|
| GUEST | ✗ | ✗ |
| VIP | ✓ | ✗ |
| VIP_SILVER | ✓ | ✗ |
| VIP_SILVER_BULLET | ✓ | ✓ |
| VIP_GOLD | ✓ | ✓ |
| VIP_PLATINUM | ✓ | ✓ |
| VIP_DIAMOND | ✓ | ✓ |

Per-tier flags are stored in `heartsync_tier_configs` and can be toggled
without a deployment. Call `POST /heartsync/tier-config/refresh` after
a DB change.

## Relay Modes

| Mode | Description |
|------|-------------|
| `BIDIRECTIONAL` | Guest ↔ Creator — each receives the other's BPM |
| `CREATOR_TO_GUEST` | Only creator BPM flows to guest device |
| `GUEST_TO_CREATOR` | Only guest BPM flows to creator device |
| `COMBINED` | "Feel as one" — arithmetic mean of both BPMs sent to both parties |

## Supported Haptic Drivers

1. **Lovense** — primary Bluetooth/USB driver
2. **Buttplug.io** — cross-device protocol
3. **ha-buttplug** — Home Assistant integration
4. **Phone Haptic** — mobile fallback (vibration API)

Driver is resolved per-session. If the preferred driver is unavailable,
HeartSyncService falls back through the priority list to `PHONE_HAPTIC`.

## Plausibility Filter

BPM samples outside **30–220 BPM** are silently rejected:
- Rejection emitted on `heartsync.plausibility.rejected`
- No relay dispatched
- No error returned to caller — audit only

## Consent Model (Law 25 / GDPR)

- Guest must call `POST /heartsync/consent/grant` before any BPM relay.
- `ip_hash` is SHA-256 of the guest IP — raw IP never stored.
- Consent can be revoked at any time via `POST /heartsync/consent/revoke`.
- Revocation clears all ephemeral BPM state immediately.
- Consent events emitted on `heartsync.consent.granted` / `heartsync.consent.revoked`.

## REST Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/heartsync/sessions` | Open a relay session |
| DELETE | `/heartsync/sessions/:id` | Close a relay session |
| GET | `/heartsync/sessions/:id` | Get ephemeral session state |
| POST | `/heartsync/consent/grant` | Grant biometric relay consent |
| POST | `/heartsync/consent/revoke` | Revoke consent |
| POST | `/heartsync/samples` | Submit a BPM sample |
| POST | `/heartsync/tier-config/refresh` | Reload tier config from DB |

## NATS Topics Emitted

| Topic | When |
|-------|------|
| `heartsync.sample.received` | Valid sample accepted |
| `heartsync.relay.emitted` | BPM relayed (non-combined modes) |
| `heartsync.combined.bpm` | Combined BPM computed |
| `heartsync.consent.granted` | Guest consented |
| `heartsync.consent.revoked` | Guest revoked consent |
| `heartsync.haptic.dispatched` | Haptic command sent |
| `heartsync.plausibility.rejected` | Sample out of 30–220 range |
| `heartsync.tier.disabled` | Session open rejected due to tier config |
| `hz.haptic.trigger` | Mirrored on legacy HZ topic for downstream |

## Ephemeral Data Only

No BPM values are written to Postgres. `HeartSyncSessionState` lives
in-process memory and is purged on `closeSession()` or process restart.
This is a deliberate privacy design decision (Law 25 / GDPR minimisation).

## Sampling Cadence

Sampling interval jitter (1.5–3 s) is enforced by the caller / device
gateway, not by this service. HeartSyncService is stateless with respect
to timing — it processes each sample as presented.
