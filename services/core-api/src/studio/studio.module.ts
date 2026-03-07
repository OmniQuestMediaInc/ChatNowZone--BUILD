// WO: WO-INIT-001
import { Module } from '@nestjs/common';
import { StudioController } from './studio.controller';
import { StudioReportService } from './studio-report.service';

@Module({
  controllers: [StudioController],
  providers: [StudioReportService],
  exports: [StudioReportService],
})
export class StudioModule {}
