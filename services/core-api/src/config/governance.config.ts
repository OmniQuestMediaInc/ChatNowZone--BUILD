// WO: WO-016-B

/**
 * GovernanceConfigService
 * Canonical source for platform-wide governance constants.
 * Timezone authority: America/Toronto (WO-016-B).
 */
export class GovernanceConfigService {
  public readonly TIMEZONE = 'America/Toronto';
  public readonly PAYOUT_RATE_SHOWTHEATER = 0.08;
  public readonly PAYOUT_RATE_REGULAR = 0.065;
}

export const COMMISSION_DEFAULTS = {
  MODEL_TOKEN_VALUE_MIN: 0.065, // USD
  MODEL_TOKEN_VALUE_MAX: 0.08,  // USD
  DEFAULT_STUDIO_AGENCY_FEE_PCT: 0.20, // 20%
  PLATFORM_SYSTEM_FEE_FLAT: 50.00,
  TIERED_PAYOUT_ENABLED_DEFAULT: false,
};

export const GEO_PRICING = {
  COUNTRY_TIER_MAP: {
    CO: 'LOW',
    VE: 'LOW',
    PE: 'LOW',
    BO: 'LOW',
    PY: 'LOW',
    BR: 'MED',
    MX: 'MED',
    AR: 'MED',
    CL: 'MED',
    PL: 'MED',
    RO: 'MED',
    DEFAULT: 'HIGH',
  } as Record<string, string>,
  TIERS: {
    LOW:  { multiplier_min: 0.33 },
    MED:  { multiplier_min: 0.60 },
    HIGH: { multiplier_min: 1.00 },
  },
};

export enum StudioFeeType {
  MEMBERSHIP = 'MEMBERSHIP_FIXED',
  HOURLY_SERVICE = 'SERVICE_HOURLY',
  SESSION_SERVICE = 'SERVICE_SESSION',
  PLATFORM_USAGE_PCT = 'PLATFORM_PCT',
  PENALTY = 'FINANCIAL_PENALTY'
}

// ─── DIAMOND TIER PRICING ────────────────────────────────────────────────────
export const DIAMOND_TIER = {
  PAYOUT_RATE_PER_TOKEN: 0.075,          // USD — creator payout floor for Diamond
  PLATFORM_FLOOR_PER_TOKEN: 0.077,       // USD — minimum platform price (wee profit)
  EXCHANGE_COST_DIAMOND_PCT: 0.00,       // Diamond conversion is fee-free
  EXTENSION_FEE_14_DAY_USD: 49.00,       // 14-day token expiry extension
  RECOVERY_FEE_EXPIRED_USD: 79.00,       // Fee to recover already-expired balance
  EXPIRED_CREATOR_POOL_PCT: 0.70,        // % of expired tokens to creator bonus pool
  EXPIRED_PLATFORM_MGMT_PCT: 0.30,       // % retained by OQMI as management fee
  VIP_BASELINE_PER_1000: 0.12,           // Comparison baseline shown in estimator
  VOLUME_TIERS: [
    { min_tokens: 10000,  max_tokens: 27499,  base_rate: 0.095 },
    { min_tokens: 30000,  max_tokens: 57499,  base_rate: 0.088 },
    { min_tokens: 60000,  max_tokens: Infinity, base_rate: 0.082 },
  ],
  VELOCITY_MULTIPLIERS: {
    DAYS_14:  1.00,
    DAYS_30:  1.00,
    DAYS_90:  1.08,
    DAYS_180: 1.12,
    DAYS_366: 1.15,
  },
} as const;

// ─── SHOWTOKEN EXCHANGE COSTS (ShowZone → Regular) ───────────────────────────
export const SHOWTOKEN_EXCHANGE = {
  SILVER_COST_PCT:   0.20,
  GOLD_COST_PCT:     0.15,
  PLATINUM_COST_PCT: 0.10,
  DIAMOND_COST_PCT:  0.00,
  DIAMOND_FLOOR_RATE: 0.065,             // Break-even rate for Diamond conversion
  SETTLEMENT_DAYS_MIN: 3,
  SETTLEMENT_DAYS_MAX: 5,
  // ShowToken guest price must be AT LEAST this multiple above regular token price
  SHOWTOKEN_PRICE_FLOOR_MULTIPLIER: 1.28,
} as const;

// ─── SHOWZONE THEATRE PRICING ─────────────────────────────────────────────────
export const SHOWZONE_PRICING = {
  PASS_BASE_ST_TOKENS:       100,        // Base pass price in ShowTokens
  MIN_SEATS_TO_GO_LIVE:      20,         // Auto-cancel if fewer seats sold at T-1hr
  PAYOUT_RATE_PER_ST:        0.08,       // Creator payout per ShowToken
  ST_PRICE_USD:              0.13,       // ShowToken USD price (for display/estimates)
  PHASE2_CAPACITY_PCT:       0.25,       // Phase 2 Uber Private = 25% of Phase 1 count
  PHASE2_PRICE_MULTIPLIERS: {
    TIER_1: 1.30,                        // +30% over Phase 1 pass
    TIER_2: 1.50,                        // +50%
    TIER_3: 1.80,                        // +80%
  },
  DAY_MULTIPLIERS: {
    MON: 0.85,
    TUE: 0.85,
    WED: 0.95,
    THU: 1.00,
    FRI: 1.20,
    SAT: 1.30,
    SUN: 1.10,
  },
  TIME_MULTIPLIERS: {
    // Hour ranges in America/Toronto (24h)
    AFTERNOON:  { from: 12, to: 17, multiplier: 0.90 },
    PRIME:      { from: 19, to: 23, multiplier: 1.15 },
    LATE_NIGHT: { from: 23, to: 26, multiplier: 1.10 }, // 26 = 02:00 next day
    OFF_PEAK:   { from:  0, to: 12, multiplier: 0.80 },
  },
  CREATOR_TIER_MULTIPLIERS: {
    NEW:         0.85,   // < 50 registered fans
    RISING:      1.00,   // 50–199 fans
    ESTABLISHED: 1.15,   // 200–999 fans
    STAR:        1.35,   // 1000+ fans
  },
  ADVANCE_PURCHASE_MULTIPLIERS: {
    SAME_DAY:      1.00, // 0 days ahead
    ONE_TO_THREE:  0.95, // 1–3 days ahead (early bird)
    FOUR_TO_SEVEN: 0.90, // 4–7 days ahead
    EIGHT_PLUS:    0.85, // 8+ days ahead
  },
} as const;

// ─── BIJOU PLAY.ZONE PRICING ──────────────────────────────────────────────────
export const BIJOU_PRICING = {
  ADMISSION_ST_TOKENS_BASE:  240,        // Base admission in ShowTokens
  CREATOR_SPLIT_PCT:         0.85,       // 85% to performing creator
  OQMI_SPLIT_PCT:            0.15,       // 15% to OmniQuest Media Inc.
  PAYOUT_RATE_PER_ST:        0.09,       // Creator payout per ShowToken (Bijou rate)
  ST_PRICE_USD:              0.13,       // ShowToken USD price
  MIN_SEATS_TO_GO_LIVE:      8,          // Auto-cancel threshold at T-1hr
  MAX_PARTICIPANTS:          24,         // Hard SFU cap (VIPs only; host is +1)
  WRISTBAND_DURATION_HOURS:  72,         // Same as ShowZone wristband
  SHOW_DURATION_MAX_MINS:    60,
  STANDBY_ACCEPT_WINDOW_SEC: 10,         // VIP has 10s to claim an opened seat
  CAMERA_GRACE_PERIOD_SEC:   30,         // Grace before warning screen
  CAMERA_WARNING_PERIOD_SEC: 30,         // Warning countdown before ejection
  MIN_ADVANCE_BOOKING_HOURS: 72,         // Must book 72hrs before show
  MAX_SCHEDULED_AT_ONE_TIME: 10,
  VELOCITY_RULES: {
    MAX_SHOWS_PER_24H:     1,
    CONSECUTIVE_CAP:       3,           // After 3 consecutive shows → 2-day break
    TWO_BACK_TO_BACK_BREAK_DAYS: 1,     // After 2 back-to-back → 1-day break
  },
  DAY_MULTIPLIERS: {                    // Same structure as ShowZone
    MON: 0.90,
    TUE: 0.90,
    WED: 1.00,
    THU: 1.05,
    FRI: 1.20,
    SAT: 1.25,
    SUN: 1.10,
  },
} as const;

// ─── GEO-ADAPTIVE PRICING ─────────────────────────────────────────────────────
export const GEO_PRICING = {
  TIERS: {
    LOW: { multiplier_min: 0.33, multiplier_max: 0.50, display_label: 'LOW' },
    MED: { multiplier_min: 0.60, multiplier_max: 0.80, display_label: 'MED' },
    HIGH: { multiplier: 1.00,                           display_label: 'HIGH' },
  },
  // ISO 3166-1 alpha-2 country codes → tier assignment
  // VERSIONED: any change to this map requires FIZ: commit + governance approval
  COUNTRY_TIER_MAP: {
    // LOW tier — developing economy purchasing power
    CO: 'LOW', UA: 'LOW', MX: 'LOW', PH: 'LOW', ID: 'LOW',
    VN: 'LOW', NG: 'LOW', PK: 'LOW', BD: 'LOW', EG: 'LOW',
    KE: 'LOW', ET: 'LOW', GH: 'LOW', TZ: 'LOW', UZ: 'LOW',
    // MED tier — mid-range purchasing power
    BR: 'MED', AR: 'MED', PL: 'MED', RO: 'MED', TR: 'MED',
    ZA: 'MED', MY: 'MED', TH: 'MED', CL: 'MED', CO_PLUS: 'MED',
    HU: 'MED', RS: 'MED', HR: 'MED', SK: 'MED', BG: 'MED',
    // HIGH tier — all others default to HIGH (full price)
    DEFAULT: 'HIGH',
  },
} as const;

// ─── WRISTBAND MECHANICS (SHARED) ─────────────────────────────────────────────
export const WRISTBAND = {
  SHOWZONE_DURATION_HOURS:  72,
  BIJOU_DURATION_HOURS:     72,
  // Bonus token evaporation distribution
  EVAPORATION_CREATOR_POOL_PCT: 0.70,
  EVAPORATION_PLATFORM_PCT:     0.30,
  // Minimum dwell time for bonus pool eligibility (per creator, per session)
  DWELL_MIN_ELIGIBILITY_SEC: 20,
  // Wristbands are venue-exclusive. A ShowZone wristband cannot admit to Bijou
  // and vice versa. This is enforced at admission gate level.
  VENUE_EXCLUSIVITY: true,
} as const;

// ─── MEMBERSHIP TIERS ─────────────────────────────────────────────────────────
export const MEMBERSHIP = {
  TIERS: ['VIP', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND'] as const,
  BUNDLE_TENURE_GATE_WEEKS: 5,           // Limited menu for first 5 weeks
  BUNDLE_CAPS: {
    VIP:      { initial: 1000, expanded: 1000,  risk_quote_above: 0 },
    SILVER:   { initial: 1000, expanded: 5000,  risk_quote_above: 5000 },
    GOLD:     { initial: 1000, expanded: 7500,  risk_quote_above: 7500 },
    PLATINUM: { initial: 1000, expanded: 8000,  risk_quote_above: 8000 },
    DIAMOND:  { initial: 1000, expanded: null,  risk_quote_above: 0 }, // Concierge only
  },
  TOKEN_EXPIRY_DAYS: 45,                 // Standard token window
  TOKEN_EXPIRY_BUFFER_DAYS: 1,           // T+1 logic for America/Toronto boundary
  DURATION_BONUS_TIERS: [
    { paid_months: 3,  bonus_months: 1, loyalty_multiplier: 1.0 },
    { paid_months: 6,  bonus_months: 2, loyalty_multiplier: 1.2 },
    { paid_months: 12, bonus_months: 3, loyalty_multiplier: 1.5 },
  ],
} as const;

// ─── PRIVATE CALL (PrivateCall Feature) ───────────────────────────────────────
export const PRIVATE_CALL = {
  BLOCK_DURATIONS_MINS: [6, 12, 24],
  // Per-minute premium rate must be at least this % above equivalent block rate
  PER_MINUTE_PREMIUM_MIN_PCT: 0.20,
  MIN_ADVANCE_BOOKING_HOURS: 1,          // Platform minimum; creator can set higher
  READY_CONFIRM_WINDOW_MIN_BEFORE: 5,    // Push notification sent 5 mins before
  AUTO_CANCEL_NO_CONFIRM_SEC: 90,        // Cancel if no creator confirmed at T+90s
  CREATOR_NO_SHOW_STRIKE_THRESHOLD: 3,   // Triggers review flag
} as const;

// ─── GAMIFICATION ─────────────────────────────────────────────────────────────
export const GAMIFICATION = {
  TOKEN_TIERS: [25, 45, 60],             // Low / Mid / High token price options
  GAME_TYPES: ['SPIN_WHEEL', 'SLOT_MACHINE', 'DICE'] as const,
  DICE_RANGE: { min: 2, max: 12 },       // Sum of 2d6
  PHASE2_SEAT_CAPACITY_WINDOW: 0.25,     // Phase 2 = 25% of Phase 1 attendee count
} as const;