import { Controller, Get, Param, UseGuards, CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { StatementsService } from './statements.service';

// TODO: replace temporary deny-all guard with real authentication + authorization guards before production use
@Injectable()
class StatementsDenyAllGuard implements CanActivate {
  canActivate(_context: ExecutionContext): boolean {
    // Temporary safeguard: block all access to financial statement endpoints
    return false;
  }
}

@UseGuards(StatementsDenyAllGuard)
@Controller('statements')
export class StatementsController {
  constructor(private readonly statementsService: StatementsService) {}

  @Get('studio/:studioId')
  async getStudioStatement(@Param('studioId') studioId: string) {
    return this.statementsService.getStudioStatement(studioId);
  }

  @Get('creator/:creatorId/earnings')
  async getCreatorEarnings(@Param('creatorId') creatorId: string) {
    return this.statementsService.getCreatorEarnings(creatorId);
  }
}
