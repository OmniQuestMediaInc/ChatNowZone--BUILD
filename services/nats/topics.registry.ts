// services/nats/topics.registry.ts
// NATS: Canonical topic registry — all NATS subjects in one place.
// No service may publish or subscribe to a topic not listed here.
// Any new topic requires a NATS: commit adding it to this registry first.

export const NATS_TOPICS = {
  // ── Geo-pricing & chat stream ──────────────────────────────────────────
  GEO_TIP_TRANSLATED:       'geo.tip.translated',

  // ── Gamification ──────────────────────────────────────────────────────
  GAME_OUTCOME:             'game.outcome',        // game.outcome.<session_id>

  // ── Bijou Play.Zone ────────────────────────────────────────────────────
  BIJOU_DWELL_TICK:         'bijou.dwell.tick',
  BIJOU_SEAT_OPENED:        'bijou.seat.opened',
  BIJOU_STANDBY_ALERT:      'bijou.standby.alert',
  BIJOU_CAMERA_VIOLATION:   'bijou.camera.violation',
  BIJOU_EJECTION:           'bijou.ejection',

  // ── ShowZone Theatre ───────────────────────────────────────────────────
  SHOWZONE_DWELL_TICK:      'showzone.dwell.tick',
  SHOWZONE_SEAT_OPENED:     'showzone.seat.opened',
  SHOWZONE_PHASE2_TRIGGER:  'showzone.phase2.trigger',
  SHOWZONE_SHOW_ENDED:      'showzone.show.ended',

  // ── Chat aggregation (OBS multi-platform) ─────────────────────────────
  CHAT_INGEST_RAW:          'chat.ingest.raw',
  CHAT_RESPONSE_OUTBOUND:   'chat.response.outbound',
  CHAT_BROADCAST_STAGGERED: 'chat.broadcast.staggered',

  // ── HeartZone biometrics ───────────────────────────────────────────────
  HZ_BPM_UPDATE:            'hz.bpm.update',
  HZ_HAPTIC_TRIGGER:        'hz.haptic.trigger',
  HZ_WISH_FULFILLED:        'hz.wish.fulfilled',

  // ── Risk & fraud ───────────────────────────────────────────────────────
  RISK_FLAG_RAISED:         'risk.flag.raised',
  RISK_CONTAINMENT_APPLIED: 'risk.containment.applied',

  // ── GWP / VoucherVault ─────────────────────────────────────────────────
  GWP_OFFER_TRIGGERED:      'gwp.offer.triggered',
  GWP_OFFER_ACCEPTED:       'gwp.offer.accepted',

  // ── Step-up authentication ─────────────────────────────────────────────
  STEP_UP_CHALLENGE_ISSUED:   'auth.step_up.challenge.issued',
  STEP_UP_CHALLENGE_VERIFIED: 'auth.step_up.challenge.verified',
  STEP_UP_CHALLENGE_FAILED:   'auth.step_up.challenge.failed',

  // ── Audit & compliance ─────────────────────────────────────────────────
  AUDIT_EVENT_WRITTEN:      'audit.event.written',
  WORM_EXPORT_TRIGGERED:    'worm.export.triggered',
} as const;

export type NatsTopic = typeof NATS_TOPICS[keyof typeof NATS_TOPICS];
