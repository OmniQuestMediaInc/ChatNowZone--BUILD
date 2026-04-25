// HZ: HeartSync REST controller — session management + consent endpoints
import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { HeartSyncService } from './heartsync.service';
import type {
  HapticDriver,
  HeartSyncCombinedBpm,
  HeartSyncConsent,
  HeartSyncMode,
  HeartSyncRelayEvent,
  HeartSyncSample,
  HeartSyncSessionState,
  MembershipTier,
} from './heartsync.types';

// ── REST DTOs ─────────────────────────────────────────────────────────────────

export interface OpenSessionDto {
  session_id: string;
  creator_id: string;
  guest_id: string;
  tier: MembershipTier;
  mode: HeartSyncMode;
  driver: HapticDriver;
}

export interface GrantConsentDto {
  session_id: string;
  guest_id: string;
  creator_id: string;
  ip_hash?: string;
  device_fingerprint?: string;
}

export interface RevokeConsentDto {
  session_id: string;
  guest_id: string;
  creator_id: string;
}

export interface SubmitSampleDto {
  session_id: string;
  creator_id: string;
  guest_id: string;
  source: 'CREATOR' | 'GUEST';
  bpm_raw: number;
  driver: HapticDriver;
  tier: MembershipTier;
}

export interface RefreshTierConfigDto {
  /** Operator auth token — validated by caller middleware. */
  operator_id: string;
}

// ── Controller (framework-agnostic for testability) ───────────────────────────

@Injectable()
export class HeartSyncController {
  private readonly logger = new Logger(HeartSyncController.name);

  constructor(private readonly heartSync: HeartSyncService) {}

  /** POST /heartsync/sessions */
  openSession(dto: OpenSessionDto): HeartSyncSessionState | { error: string } {
    const state = this.heartSync.openSession(
      dto.session_id,
      dto.creator_id,
      dto.guest_id,
      dto.tier,
      dto.mode,
      dto.driver,
    );
    if (!state) {
      return { error: 'HEARTSYNC_TIER_DISABLED_OR_COMBINED_NOT_PERMITTED' };
    }
    return state;
  }

  /** POST /heartsync/consent/grant */
  grantConsent(dto: GrantConsentDto): HeartSyncConsent {
    return this.heartSync.grantConsent(
      dto.session_id,
      dto.guest_id,
      dto.creator_id,
      dto.ip_hash,
      dto.device_fingerprint,
    );
  }

  /** POST /heartsync/consent/revoke */
  revokeConsent(dto: RevokeConsentDto): { ok: true } {
    this.heartSync.revokeConsent(dto.session_id, dto.guest_id, dto.creator_id);
    return { ok: true };
  }

  /** POST /heartsync/samples */
  submitSample(dto: SubmitSampleDto): HeartSyncRelayEvent | HeartSyncCombinedBpm | { ok: false; reason: string } {
    const sample: HeartSyncSample = {
      sample_id: randomUUID(),
      session_id: dto.session_id,
      creator_id: dto.creator_id,
      guest_id: dto.guest_id,
      source: dto.source,
      bpm_raw: dto.bpm_raw,
      captured_device_ms: Date.now(),
      received_at_utc: new Date().toISOString(),
      driver: dto.driver,
      tier: dto.tier,
    };

    const result = this.heartSync.submitSample(sample);
    if (!result) {
      return { ok: false, reason: 'SAMPLE_REJECTED_OR_NO_SESSION' };
    }
    return result;
  }

  /** DELETE /heartsync/sessions/:session_id */
  closeSession(session_id: string): { ok: true } {
    this.heartSync.closeSession(session_id);
    return { ok: true };
  }

  /** GET /heartsync/sessions/:session_id */
  getSession(session_id: string): HeartSyncSessionState | { error: string } {
    const state = this.heartSync.getSessionState(session_id);
    if (!state) {
      return { error: 'SESSION_NOT_FOUND' };
    }
    return state;
  }

  /** POST /heartsync/tier-config/refresh */
  async refreshTierConfig(_dto: RefreshTierConfigDto): Promise<{ ok: true }> {
    await this.heartSync.refreshTierConfig();
    return { ok: true };
  }
}
