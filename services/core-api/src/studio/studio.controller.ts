import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { StudioReportService } from './studio-report.service';

@Controller('studio')
export class StudioController {
  constructor(private readonly studioReportService: StudioReportService) {}

  @Get(':studioId/earnings')
  async getEarnings(@Param('studioId', ParseUUIDPipe) studioId: string) {
    return this.studioReportService.getStudioEarnings(studioId);
  }

  @Get(':studioId/summary')
  async getSummary(@Param('studioId', ParseUUIDPipe) studioId: string) {
    return this.studioReportService.getStudioSummary(studioId);
  }
}
