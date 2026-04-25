// WO-003 — Room-Heat Engine: controller
// REST surface for the Room-Heat Engine service.
// All endpoints are advisory / read-oriented; no ledger mutations here.
import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import type { LeaderboardCategory } from './types/room-heat.types';
import type { RoomHeatLeaderboard, RoomHeatScore } from './types/room-heat.types';
import { IngestRoomHeatDto, TipEventDto } from './dto/room-heat.dto';
import { RoomHeatService } from './room-heat.service';

@Controller('room-heat')
export class RoomHeatController {
  private readonly logger = new Logger(RoomHeatController.name);

  constructor(private readonly roomHeatService: RoomHeatService) {}

  /**
   * GET /room-heat/leaderboard?category=all|standard|dual_flame|hot_and_ready|new_flames
   *
   * Returns the 10×10 leaderboard grid.
   * Coolest sessions appear at the top (rank 0); hottest at the bottom (rank 99).
   */
  @Get('leaderboard')
  getLeaderboard(
    @Query('category') category?: string,
  ): RoomHeatLeaderboard {
    const validCategories: LeaderboardCategory[] = [
      'all',
      'standard',
      'dual_flame',
      'hot_and_ready',
      'new_flames',
    ];
    const cat: LeaderboardCategory = validCategories.includes(
      category as LeaderboardCategory,
    )
      ? (category as LeaderboardCategory)
      : 'all';

    this.logger.log('RoomHeatController.getLeaderboard', { category: cat });
    return this.roomHeatService.getLeaderboard(cat);
  }

  /**
   * GET /room-heat/session/:sessionId
   *
   * Returns the current heat score for a live session, or 404 if unknown.
   */
  @Get('session/:sessionId')
  getSessionHeat(
    @Param('sessionId') sessionId: string,
  ): RoomHeatScore | { message: string; session_id: string } {
    const score = this.roomHeatService.getSessionHeat(sessionId);
    if (!score) {
      return { message: 'Session not found or not yet active', session_id: sessionId };
    }
    return score;
  }

  /**
   * POST /room-heat/ingest
   *
   * Ingest a full telemetry frame. Returns the computed heat score.
   * Used by the creator-control surface and integration tests.
   */
  @Post('ingest')
  ingestSample(@Body() dto: IngestRoomHeatDto): RoomHeatScore {
    this.logger.log('RoomHeatController.ingestSample', {
      session_id: dto.session_id,
      creator_id: dto.creator_id,
    });
    return this.roomHeatService.ingest(dto);
  }

  /**
   * POST /room-heat/session/:sessionId/start
   *
   * Pre-register a session before the first telemetry frame.
   * Callers may omit this — the session is auto-registered on first ingest.
   */
  @Post('session/:sessionId/start')
  startSession(
    @Param('sessionId') sessionId: string,
    @Body() body: { creator_id: string; is_dual_flame?: boolean },
  ): { session_id: string; started: boolean } {
    this.roomHeatService.startSession(
      sessionId,
      body.creator_id,
      body.is_dual_flame ?? false,
    );
    return { session_id: sessionId, started: true };
  }

  /**
   * DELETE /room-heat/session/:sessionId
   *
   * Teardown session heat state and stop the 1 Hz publisher.
   * Call this when a broadcast ends.
   */
  @Delete('session/:sessionId')
  endSession(
    @Param('sessionId') sessionId: string,
  ): { session_id: string; ended: boolean } {
    this.roomHeatService.endSession(sessionId);
    return { session_id: sessionId, ended: true };
  }

  /**
   * POST /room-heat/tip-event
   *
   * Trigger adaptive weight learning from a tip event.
   * Called by the tip service whenever a tip is completed.
   */
  @Post('tip-event')
  recordTipEvent(@Body() dto: TipEventDto): { learned: boolean } {
    this.logger.log('RoomHeatController.recordTipEvent', {
      session_id: dto.session_id,
      creator_id: dto.creator_id,
      tokens:     dto.tokens,
    });
    this.roomHeatService.learnFromTipEvent(dto.heat_context);
    return { learned: true };
  }

  /**
   * GET /room-heat/adaptive-weights/:creatorId
   *
   * Returns the adaptive weight multipliers for a creator (advisory / debug).
   */
  @Get('adaptive-weights/:creatorId')
  getAdaptiveWeights(
    @Param('creatorId') creatorId: string,
  ) {
    return this.roomHeatService.getAdaptiveWeightsPublic(creatorId);
  }
}
