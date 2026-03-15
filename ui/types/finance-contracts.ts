/**
 * Represents the normalized response from the Ingestion Gateway.
 * Note: BigInts are transmitted as Strings over JSON to prevent precision loss.
 */
export interface ISplitResponse {
  success: boolean;
  data: {
    transactionId: string;
    modelId: string;
    studioId: string;
    grossCents: string;           // "10050" (BigInt as string)
    modelNetCents: string;        // "8040"
    studioAgencyHoldbackCents: string;
    studioServiceFeesCents: string;
    platformSystemFeeCents: string;
    checksum: string;             // SHA-256 integrity signature
    metadata: {
      isTieredApplied: boolean;
      feeExclusionVerified: boolean;
      timestamp: string;
    };
  };
  governance_code?: string;       // For UI-specific Red Book error handling
}

/**
 * Input contract for submitting split requests from the Studio Admin Dashboard.
 */
export interface ISplitRequest {
  grossTokens: number;
  tokenRate: number;              // e.g., 0.07
  agencyFeePct: number;           // e.g., 0.20 for 20%
  activeFees: Array<{
    type: 'STUDIO_MEMBERSHIP_FIXED' | 'STUDIO_SERVICE_HOURLY' | 'STUDIO_SERVICE_SESSION';
    value: number;
    units?: number;
  }>;
}

/**
 * Helper utility for the UI to format Cents into Localized USD strings.
 * Ensures the "View Only" secondary currency logic remains consistent.
 */
export const formatCentsToUSD = (cents: string | bigint): string => {
  const amount = typeof cents === 'string' ? BigInt(cents) : cents;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(amount) / 100);
};