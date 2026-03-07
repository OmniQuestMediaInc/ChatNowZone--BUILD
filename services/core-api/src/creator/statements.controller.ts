import { Controller, Get, Param, Query, UseGuards, CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { StatementsService } from './statements.service';

// TODO: replace temporary deny-all guard with real authentication + authorization guards before production use
@Injectable()
class StatementsDenyAllGuard implements CanActivate {
  canActivate(_context: ExecutionContext): boolean {
    // Temporary safeguard: block all access to financial statement endpoints
    return false;
  }
}

function parsePaginationParam(value: string | undefined): number | undefined {
  if (value === undefined) return undefined;
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

@UseGuards(new StatementsDenyAllGuard())
@Controller('statements')
export class StatementsController {
  constructor(private readonly statementsService: StatementsService) {}

  @Get('studio/:studioId')
  async getStudioStatement(
    @Param('studioId') studioId: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.statementsService.getStudioStatement(studioId, {
      skip: parsePaginationParam(skip),
      take: parsePaginationParam(take),
    });
  }

  @Get('creator/:creatorId/earnings')
  async getCreatorEarnings(
    @Param('creatorId') creatorId: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.statementsService.getCreatorEarnings(creatorId, {
      skip: parsePaginationParam(skip),
      take: parsePaginationParam(take),
    });
  }
}
