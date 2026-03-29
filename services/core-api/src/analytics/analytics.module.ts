// services/core-api/src/analytics/analytics.module.ts
import { Module } from '@nestjs/common';
import { HeatScoreService } from './heat-score.service';

@Module({
  providers: [HeatScoreService],
  exports: [HeatScoreService],
})
export class AnalyticsModule {}
