// services/nats/topics.registry.ts
// NATS: Canonical topic registry — all NATS subjects in one place.
// No service may publish or subscribe to a topic not listed here.
// Any new topic requires a NATS: commit adding it to this registry first.

export const NATS_TOPICS = {
  // ── Geo-pricing & chat stream ──────────────────────────────────────────
  GEO_TIP_TRANSLATED:       'geo.tip.translated',
  GEO_BLOCK_ENFORCED:       'geo.block.enforced',

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

  // ── KYC / Publish gate ─────────────────────────────────────────────────
  PUBLISH_GATE_APPROVED:    'kyc.publish_gate.approved',
  PUBLISH_GATE_BLOCKED:     'kyc.publish_gate.blocked',

  // ── Moderation / Incident lifecycle ─────────────────────────────────────
  INCIDENT_TRANSITION:      'moderation.incident.transition',

  // ── Audit & compliance ─────────────────────────────────────────────────
  AUDIT_EVENT_WRITTEN:              'audit.event.written',
  AUDIT_CHAIN_INTEGRITY_FAILURE:    'audit.chain.integrity_failure',
  WORM_EXPORT_TRIGGERED:            'worm.export.triggered',

  // ── Legal hold ─────────────────────────────────────────────────────────
  LEGAL_HOLD_APPLIED:       'compliance.legal_hold.applied',
  LEGAL_HOLD_LIFTED:        'compliance.legal_hold.lifted',

  // ── Reconciliation (INFRA-004 — L0 ship-gate) ─────────────────────────
  RECONCILIATION_DRIFT_DETECTED: 'compliance.reconciliation.drift_detected',

  // ── PROC-001: Webhook hardening (FIZ) ─────────────────────────────────
  WEBHOOK_VALIDATION_FAILURE: 'fiz.webhook.validation.failure',
  WEBHOOK_DLQ:                'fiz.webhook.dlq',
  WEBHOOK_RECEIVED:           'payments.webhook.received',
  WEBHOOK_VERIFIED:           'payments.webhook.verified',
  WEBHOOK_REJECTED:           'payments.webhook.rejected',
  WEBHOOK_DUPLICATE:          'payments.webhook.duplicate',
  WEBHOOK_DEAD_LETTER:        'payments.webhook.dead_letter',

  // ── DFSP Module 3 — Platform OTP ──────────────────────────────────────
  DFSP_OTP_ISSUED:              'dfsp.otp.issued',
  DFSP_OTP_VERIFIED:            'dfsp.otp.verified',
  DFSP_OTP_FAILED:              'dfsp.otp.failed',
  DFSP_OTP_EXPIRED:             'dfsp.otp.expired',

  // ── DFSP Module 4 — Account Recovery Hold ─────────────────────────────
  DFSP_ACCOUNT_HOLD_APPLIED:    'dfsp.account.hold.applied',
  DFSP_ACCOUNT_HOLD_RELEASED:   'dfsp.account.hold.released',

  // ── DFSP — Diamond Financial Security Platform (PV-001) ───────────────
  PURCHASE_WINDOW_BLOCKED:             'dfsp.purchase_window.blocked',
  RISK_ASSESSMENT_COMPLETED:           'dfsp.risk.assessment_completed',
  RISK_AUTO_BAR_TRIGGERED:             'dfsp.risk.auto_bar_triggered',
  INTEGRITY_HOLD_AUTHORIZED:           'dfsp.integrity_hold.authorized',
  INTEGRITY_HOLD_RELEASED:             'dfsp.integrity_hold.released',
  INTEGRITY_HOLD_CAPTURED:             'dfsp.integrity_hold.captured',
  CHECKOUT_CONFIRMED:                  'dfsp.checkout.confirmed',
  CHECKOUT_EMAIL_RECEIPT_REQUESTED:    'dfsp.checkout.email_receipt_requested',
  CHECKOUT_SMS_NOTIFICATION_REQUESTED: 'dfsp.checkout.sms_notification_requested',
} as const;

export type NatsTopic = typeof NATS_TOPICS[keyof typeof NATS_TOPICS];
