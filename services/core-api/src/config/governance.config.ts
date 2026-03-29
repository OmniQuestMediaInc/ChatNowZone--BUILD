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
    PH: 'LOW',
    BR: 'MED',
    MX: 'MED',
    AR: 'MED',
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