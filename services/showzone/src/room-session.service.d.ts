import { NatsService } from '../../core-api/src/nats/nats.service';
export type RoomStatus = 'DRAFT' | 'SCHEDULED' | 'COUNTDOWN' | 'LIVE_PHASE_1' | 'LIVE_PHASE_2' | 'ENDED' | 'CANCELLED';
export interface RoomSession {
    session_id: string;
    creator_id: string;
    venue: 'SHOWZONE';
    status: RoomStatus;
    scheduled_at_utc: string;
    phase2_enabled: boolean;
    phase2_capacity: number;
    pass_price_st: number;
    phase2_price_st: number;
    seats_sold: number;
    min_seats: number;
    countdown_started_at_utc?: string;
    live_started_at_utc?: string;
    phase2_started_at_utc?: string;
    ended_at_utc?: string;
    cancellation_reason?: string;
    rule_applied_id: string;
}
export declare class RoomSessionService {
    private readonly nats;
    private readonly logger;
    private readonly RULE_ID;
    constructor(nats: NatsService);
    transition(session: RoomSession, to: RoomStatus, reason?: string): RoomSession;
    evaluateMinSeatGate(session: RoomSession): {
        session: RoomSession;
        cancelled: boolean;
        reason_code: string;
    };
    buildReconciliationSnapshot(session: RoomSession): {
        session_id: string;
        creator_id: string;
        gross_st: number;
        creator_pool_st: number;
        platform_pool_st: number;
        phase2_gross_st: number;
        payout_rate_usd: number;
        rule_applied_id: string;
    };
}
