"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var RoomSessionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomSessionService = void 0;
const common_1 = require("@nestjs/common");
const nats_service_1 = require("../../core-api/src/nats/nats.service");
const topics_registry_1 = require("../../nats/topics.registry");
const governance_config_1 = require("../../core-api/src/config/governance.config");
const VALID_TRANSITIONS = {
    DRAFT: ['SCHEDULED', 'CANCELLED'],
    SCHEDULED: ['COUNTDOWN', 'CANCELLED'],
    COUNTDOWN: ['LIVE_PHASE_1', 'CANCELLED'],
    LIVE_PHASE_1: ['LIVE_PHASE_2', 'ENDED'],
    LIVE_PHASE_2: ['ENDED'],
    ENDED: [],
    CANCELLED: [],
};
let RoomSessionService = RoomSessionService_1 = class RoomSessionService {
    constructor(nats) {
        this.nats = nats;
        this.logger = new common_1.Logger(RoomSessionService_1.name);
        this.RULE_ID = 'SHOWZONE_LIFECYCLE_v1';
    }
    transition(session, to, reason) {
        const allowed = VALID_TRANSITIONS[session.status];
        if (!allowed.includes(to)) {
            const msg = `INVALID_TRANSITION: ${session.status} → ${to} is not permitted ` +
                `for session ${session.session_id}. ` +
                `Allowed: [${allowed.join(', ')}]`;
            this.logger.error(msg, undefined, { session_id: session.session_id });
            throw new Error(msg);
        }
        const now = new Date().toISOString();
        const updated = { ...session, status: to };
        if (to === 'COUNTDOWN')
            updated.countdown_started_at_utc = now;
        if (to === 'LIVE_PHASE_1')
            updated.live_started_at_utc = now;
        if (to === 'LIVE_PHASE_2')
            updated.phase2_started_at_utc = now;
        if (to === 'ENDED')
            updated.ended_at_utc = now;
        if (to === 'CANCELLED')
            updated.cancellation_reason = reason ?? 'NO_REASON_PROVIDED';
        this.logger.log('RoomSessionService: status transition', {
            session_id: session.session_id,
            from: session.status,
            to,
            reason: reason ?? null,
            rule_applied_id: this.RULE_ID,
        });
        const topic = to === 'ENDED' ? topics_registry_1.NATS_TOPICS.SHOWZONE_SHOW_ENDED
            : to === 'LIVE_PHASE_2' ? topics_registry_1.NATS_TOPICS.SHOWZONE_PHASE2_TRIGGER
                : null;
        if (topic) {
            this.nats.publish(topic, {
                session_id: session.session_id,
                creator_id: session.creator_id,
                status: to,
                timestamp_utc: now,
                rule_applied_id: this.RULE_ID,
            });
        }
        return updated;
    }
    evaluateMinSeatGate(session) {
        if (session.seats_sold >= session.min_seats) {
            return { session, cancelled: false, reason_code: 'MIN_SEAT_GATE_PASSED' };
        }
        const cancelled = this.transition(session, 'CANCELLED', `MIN_SEAT_GATE_FAILED: ${session.seats_sold}/${session.min_seats} seats at T-1hr`);
        this.logger.warn('RoomSessionService: auto-cancel triggered at T-1hr gate', {
            session_id: session.session_id,
            seats_sold: session.seats_sold,
            min_seats: session.min_seats,
            rule_applied_id: this.RULE_ID,
        });
        return {
            session: cancelled,
            cancelled: true,
            reason_code: `MIN_SEAT_GATE_FAILED: ${session.seats_sold}/${session.min_seats}`,
        };
    }
    buildReconciliationSnapshot(session) {
        const admissionGross = session.pass_price_st * session.seats_sold;
        const creatorPool = Math.round(admissionGross * 0.85);
        const platformPool = admissionGross - creatorPool;
        const phase2Seats = session.phase2_enabled
            ? Math.min(Math.round(session.seats_sold * governance_config_1.SHOWZONE_PRICING.PHASE2_CAPACITY_PCT), session.seats_sold)
            : 0;
        const phase2Gross = session.phase2_enabled
            ? session.phase2_price_st * phase2Seats
            : 0;
        return {
            session_id: session.session_id,
            creator_id: session.creator_id,
            gross_st: admissionGross,
            creator_pool_st: creatorPool,
            platform_pool_st: platformPool,
            phase2_gross_st: phase2Gross,
            payout_rate_usd: governance_config_1.SHOWZONE_PRICING.PAYOUT_RATE_PER_ST,
            rule_applied_id: this.RULE_ID,
        };
    }
};
exports.RoomSessionService = RoomSessionService;
exports.RoomSessionService = RoomSessionService = RoomSessionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [nats_service_1.NatsService])
], RoomSessionService);
//# sourceMappingURL=room-session.service.js.map