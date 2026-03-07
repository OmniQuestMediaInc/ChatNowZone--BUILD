// WO: WO-INIT-001
import {
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { StudioReportService } from './studio-report.service';

@Controller('studio')
export class StudioController {
  constructor(private readonly studioReportService: StudioReportService) {}

  @Get(':studioId/earnings')
  async getEarnings(
    @Param('studioId', ParseUUIDPipe) studioId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(100), ParseIntPipe)
    pageSize: number,
  ) {
    return this.studioReportService.getStudioEarnings(studioId, page, pageSize);
  }

  @Get(':studioId/summary')
  async getSummary(@Param('studioId', ParseUUIDPipe) studioId: string) {
    return this.studioReportService.getStudioSummary(studioId);
  }
}
