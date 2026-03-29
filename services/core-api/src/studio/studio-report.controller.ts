import { Controller, Get } from '@nestjs/common';
import { StudioReportService } from './studio-report.service';

@Controller('studio-report')
export class StudioReportController {
  constructor(private readonly studioReportService: StudioReportService) {}

  @Get('earnings')
  async getEarnings() {
    return this.studioReportService.getStudioEarnings();
  }
}