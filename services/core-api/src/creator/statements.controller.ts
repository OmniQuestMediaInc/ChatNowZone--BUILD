import { Controller, Get, Param } from '@nestjs/common';
import { StatementsService } from './statements.service';

// TODO: apply authentication + authorization guards before production use
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
